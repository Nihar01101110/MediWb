const express = require('express');
const router = express.Router();
const { getMedicineInfo } = require('../controllers/medicineController');

router.get('/:medicineName', getMedicineInfo);

module.exports = router;