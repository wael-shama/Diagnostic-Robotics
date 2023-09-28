const express = require('express');
const axios = require('axios');
const router = express.Router();

// Open Prescription API
router.post('/open_prescription', (req, res) => {
  const patientId = req.body.patient_id;
  const dataStore = req.app.get('dataStore');

  // Create a new prescription and get its ID from the data store
  const prescriptionId = dataStore.createPrescription(patientId);

  // Return a JSON response with the prescription ID
  res.status(201).json({ prescription_id: prescriptionId });
});

// Add Medication API
router.post('/add_medication', async (req, res) => {
  const prescriptionId = req.body.prescription_id;
  const medicationName = req.body.medication_name;
  const dosage = req.body.dosage;
  const frequency = req.body.frequency;
  const dataStore = req.app.get('dataStore');
 
  try {

    // If medicationCode found in the DB
    const medicationCode = dataStore.getMedicationCodeByName(medicationName);
    if (medicationCode){
      const medication = { name: medicationName, code: medicationCode, dosage, frequency };
      dataStore.addMedicationToPrescription(prescriptionId, medication);
      res.status(201).json({ message: 'Medication added successfully' });
    }else{
      // Search for the medication by name in the external API
      const response = await axios.get(`https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${medicationName}&ef=RXCUIS`);
      const totalMedications = response.data[0]; // Total number of medications found
      const medicationNames = response.data[1]; // Medication names found
      const medicationCodes = response.data[2].RXCUIS; // Medication codes found

      if (totalMedications === 0) {
        // No medications found with the given name
        res.status(404).json({ error: 'Medication not found' });
      } else {
        // At least one medication found
        // For simplicity, we assume the first medication is the desired one
        const medicationCode = medicationCodes[0];

        // Add the medication to the prescription
        const medicationName = medicationNames[0];
        const medication = { name: medicationName, code: medicationCode, dosage, frequency };
        dataStore.saveMedicationCode(medicationName, medicationCode);
        const success = dataStore.addMedicationToPrescription(prescriptionId, medication);

        if (success) {
          res.status(201).json({ message: 'Medication added successfully' });
        } else {
          res.status(404).json({ error: 'Prescription not found' });
        }
      }
    }
  } catch (error) {
    console.error('Error while searching for medication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Close Prescription API
router.post('/close_prescription', async (req, res) => {
  const prescriptionId = req.body.prescription_id;
  const dataStore = req.app.get('dataStore');
  const medications = dataStore.getMedicationsInPrescription(prescriptionId);

  if (!medications) {
    res.status(404).json({ error: 'Prescription not found' });
    return;
  }

  // Extract medication codes from all medications in the prescription and join them with '+'
  // Join all codes into a single string separated by '+'
  const medicationCodes = medications.flatMap((medication) => medication.code).join('+');
  // Use the external API to detect interactions
  try {
    const response = await axios.get(`https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${medicationCodes}`);
    const interactions = response.data.fullInteractionTypeGroup;

    res.status(200).json({ interactions });
  } catch (error) {
    console.error('Error while detecting interactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
