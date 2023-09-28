const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Import your Express app
const dataStore = require('../dataStore'); // Import your dataStore module
const axios = require('axios');
const sinon = require('sinon');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Prescription Router', () => {
  // Initialize the data store and set it in the app
  const dataStoreInstance = new dataStore();
  app.set('dataStore', dataStoreInstance);

  beforeEach(() => {
    // Clear the data store before each test
    dataStoreInstance.prescriptions = {};
    dataStoreInstance.medications = {};
  });

  describe('POST /prescriptions/open_prescription', () => {
    it('should open a new prescription', (done) => {
      chai
        .request(app)
        .post('/prescriptions/open_prescription')
        .send({ patient_id: 'patient123' })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('prescription_id');
          done();
        });
    });
  });

  describe('POST /prescriptions/add_medication', () => {
    it('should add a medication to a prescription if the medication exists', (done) => {
      // Stub the Axios GET request to the external API
      const axiosStub = sinon.stub(axios, 'get');
      axiosStub.resolves({
        data: [1, ['Advil'], { RXCUIS: [['123456']] }],
      });

      // Create a prescription
      const prescriptionId = dataStoreInstance.createPrescription('patient456');

      chai
        .request(app)
        .post('/prescriptions/add_medication')
        .send({
          prescription_id: prescriptionId,
          medication_name: 'Advil',
          dosage: '200mg',
          frequency: 'once daily',
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message', 'Medication added successfully');
          axiosStub.restore(); // Restore the stubbed Axios method
          done();
        });
    });

    it('should return an error if the medication does not exist', (done) => {
      // Stub the Axios GET request to the external API
      const axiosStub = sinon.stub(axios, 'get');
      axiosStub.resolves({
        data: [0, [], { RXCUIS: [] }],
      });

      // Create a prescription
      const prescriptionId = dataStoreInstance.createPrescription('patient789');

      chai
        .request(app)
        .post('/prescriptions/add_medication')
        .send({
          prescription_id: prescriptionId,
          medication_name: 'NonExistentMedication',
          dosage: '200mg',
          frequency: 'once daily',
        })
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('error', 'Medication not found');
          axiosStub.restore(); // Restore the stubbed Axios method
          done();
        });
    });
  });

  describe('POST /prescriptions/close_prescription', () => {
    it('should close a prescription and detect interactions if medications exist', (done) => {
      // Stub the Axios GET request to the external API for interactions
      const axiosStub = sinon.stub(axios, 'get');
      axiosStub.resolves({
        data: {
          fullInteractionTypeGroup: [{ sourceDisclaimer: 'Disclaimer', fullInteractionType: [{ interactionPair: [] }] }],
        },
      });

      // Create a prescription
      const prescriptionId = dataStoreInstance.createPrescription('patient789');

      // Add medications to the prescription
      dataStoreInstance.addMedicationToPrescription(prescriptionId, {
        name: 'Medication1',
        code: '123',
        dosage: '200mg',
        frequency: 'once daily',
      });
      dataStoreInstance.addMedicationToPrescription(prescriptionId, {
        name: 'Medication2',
        code: '456',
        dosage: '300mg',
        frequency: 'twice daily',
      });

      chai
        .request(app)
        .post('/prescriptions/close_prescription')
        .send({ prescription_id: prescriptionId })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('interactions');
          axiosStub.restore(); // Restore the stubbed Axios method
          done();
        });
   
    });
  });
});

