class DataStore {
  constructor() {
    this.prescriptions = {};
    this.medications = {};
  }

  // Create a new prescription and return its ID
  createPrescription(patientId) {
    const prescriptionId = this.generateUniquePrescriptionId();
    this.prescriptions[prescriptionId] = { patientId, medications: [] };
    return prescriptionId;
  }

  generateUniquePrescriptionId() {
    // UUID
    return 'PR' + Math.random().toString(36).substring(7);
  }

  // Get a prescription by ID
  getPrescriptionById(prescriptionId) {
    return this.prescriptions[prescriptionId];
  }

  // Add a medication to a prescription
  addMedicationToPrescription(prescriptionId, medication) {
    if (this.prescriptions[prescriptionId]) {
      this.prescriptions[prescriptionId].medications.push(medication);
      return true;
    }
    return false;
  }

  // Save medication code for future reference
  saveMedicationCode(medicationName, medicationCode) {
    this.medications[medicationName] = medicationCode;
  }

  // Get medication code by name
  getMedicationCodeByName(medicationName) {
    return this.medications[medicationName];
  }

  // Get medications associated with a prescription
  getMedicationsInPrescription(prescriptionId) {
    const prescription = this.prescriptions[prescriptionId];
    if (prescription) {
      return prescription.medications;
    }
    return null;
  }

}

module.exports = DataStore;
