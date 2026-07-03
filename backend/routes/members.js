const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Member = require('../models/Member');

// ── Multer Setup ────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only JPG, PNG, PDF files are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

const uploadFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
]);

// ── Routes ──────────────────────────────────────────────────────────────────

// @desc   Get statistics
// @route  GET /api/members/stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Member.countDocuments();
    const approved = await Member.countDocuments({ status: 'approved' });
    const pending = await Member.countDocuments({ status: 'pending' });
    const rejected = await Member.countDocuments({ status: 'rejected' });

    // Gender stats
    const genderStats = await Member.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } },
    ]);

    // Monthly registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthly = await Member.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ total, approved, pending, rejected, genderStats, monthly });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc   Get all members (with pagination + search + filter)
// @route  GET /api/members
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.json({
      members,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc   Get single member by memberId
// @route  GET /api/members/by-memberid/:memberId
router.get('/by-memberid/:memberId', async (req, res) => {
  try {
    const member = await Member.findOne({ memberId: req.params.memberId });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc   Get single member
// @route  GET /api/members/:id
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc   Register new member
// @route  POST /api/members
router.post('/', (req, res) => {
  uploadFields(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      const data = { ...req.body };
      if (req.files?.photo) data.photoPath = req.files.photo[0].filename;
      if (req.files?.idProof) data.idProofPath = req.files.idProof[0].filename;

      const member = new Member(data);
      await member.save();
      res.status(201).json({ message: 'Member registered successfully!', member });
    } catch (err) {
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: messages.join(', ') });
      }
      res.status(500).json({ message: err.message });
    }
  });
});

// @desc   Update member status
// @route  PATCH /api/members/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: `Status updated to ${status}`, member });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc   Delete member
// @route  DELETE /api/members/:id
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    // Delete uploaded files if exist
    ['photoPath', 'idProofPath'].forEach((field) => {
      if (member[field]) {
        const filePath = path.join(uploadDir, member[field]);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });

    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
