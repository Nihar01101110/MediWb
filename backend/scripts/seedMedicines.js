const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Medicine = require('../models/Medicine');

const medicines = [
  { brandName: 'Tylenol', genericName: 'Acetaminophen', usage: 'Used to treat mild to moderate pain (from headaches, menstrual periods, toothaches, backaches, osteoarthritis, or cold/flu aches and pains) and to reduce fever.', foodInteraction: 'Can be taken with or without food. If it upsets your stomach, take it with food.' },
  { brandName: 'Advil', genericName: 'Ibuprofen', usage: 'Used to relieve pain from various conditions such as headache, dental pain, menstrual cramps, muscle aches, or arthritis. It is also used to reduce fever and to relieve minor aches and pains due to the common cold or flu.', foodInteraction: 'Take with food or milk to prevent stomach upset.' },
  { brandName: 'Zyrtec', genericName: 'Cetirizine', usage: 'An antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, itching eyes/nose, sneezing, hives, and itching.', foodInteraction: 'Can be taken with or without food.' },
  { brandName: 'Benadryl', genericName: 'Diphenhydramine', usage: 'An antihistamine used to relieve symptoms of allergy, hay fever, and the common cold. These symptoms include rash, itching, watery eyes, itchy eyes/nose/throat, cough, runny nose, and sneezing.', foodInteraction: 'Can be taken with or without food. May cause drowsiness.' },
  { brandName: 'Lisinopril', genericName: 'Lisinopril', usage: 'An ACE inhibitor used to treat high blood pressure (hypertension). Lowering high blood pressure helps prevent strokes, heart attacks, and kidney problems.', foodInteraction: 'Can be taken with or without food, but take it the same way each day.' },
  { brandName: 'Metformin', genericName: 'Metformin', usage: 'Used with a proper diet and exercise program to control high blood sugar in people with type 2 diabetes.', foodInteraction: 'Should be taken with meals to help reduce stomach upset.' },
  { brandName: 'Amoxicillin', genericName: 'Amoxicillin', usage: 'A penicillin antibiotic that fights bacteria. Used to treat many different types of infection caused by bacteria, such as tonsillitis, bronchitis, pneumonia, and infections of the ear, nose, throat, skin, or urinary tract.', foodInteraction: 'Can be taken with or without food.' },
  { brandName: 'Lipitor', genericName: 'Atorvastatin', usage: "Used along with a proper diet to help lower 'bad' cholesterol and fats (such as LDL, triglycerides) and raise 'good' cholesterol (HDL) in the blood.", foodInteraction: 'Can be taken with or without food, at any time of day.' },
  { brandName: 'Zoloft', genericName: 'Sertraline', usage: 'An antidepressant in a group of drugs called selective serotonin reuptake inhibitors (SSRIs). It affects chemicals in the brain that may be unbalanced in people with depression, panic, anxiety, or obsessive-compulsive symptoms.', foodInteraction: 'Can be taken with or without food.' },
  { brandName: 'Xanax', genericName: 'Alprazolam', usage: 'Used to treat anxiety and panic disorders. It belongs to a class of medications called benzodiazepines which act on the brain and nerves to produce a calming effect.', foodInteraction: 'Can be taken with or without food. Avoid grapefruit juice as it can increase side effects.' },
  { brandName: 'Aspirin', genericName: 'Acetylsalicylic acid', usage: 'Used to reduce fever and relieve mild to moderate pain from conditions such as muscle aches, toothaches, common cold, and headaches. It may also be used to reduce pain and swelling in conditions such as arthritis.', foodInteraction: 'Take with food to prevent stomach upset. Do not take with alcohol.' },
  { brandName: 'Prozac', genericName: 'Fluoxetine', usage: 'A selective serotonin reuptake inhibitor (SSRI) antidepressant. Used to treat major depressive disorder, bulimia nervosa, obsessive-compulsive disorder, panic disorder, and premenstrual dysphoric disorder (PMDD).', foodInteraction: 'Can be taken with or without food.' },
  { brandName: 'Singulair', genericName: 'Montelukast', usage: 'Used to prevent wheezing, difficulty breathing, chest tightness, and coughing caused by asthma. Also used to prevent bronchospasm during exercise.', foodInteraction: 'Can be taken with or without food. Take in the evening.' },
  { brandName: 'Lexapro', genericName: 'Escitalopram', usage: 'An antidepressant belonging to the SSRI class. Used to treat depression and generalized anxiety disorder.', foodInteraction: 'Can be taken with or without food.' },
  { brandName: 'Ambien', genericName: 'Zolpidem', usage: 'A sedative, also called a hypnotic. It affects chemicals in the brain that may be unbalanced in people with sleep problems (insomnia).', foodInteraction: 'Do not take with or immediately after a meal, as this can slow down its effects. Take on an empty stomach right before getting into bed.' }
];

(async () => {
  try {
    await connectDB();
    await Medicine.deleteMany({});
    await Medicine.insertMany(medicines);
    console.log('Medicines seeded:', medicines.length);
  } catch (e) {
    console.error('Seeding failed:', e);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();


