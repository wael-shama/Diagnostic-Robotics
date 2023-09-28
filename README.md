Diagnostic Robotics Assignment

# Install It

```npm install```


# Test it using Curl/Postman

curl -X POST -H "Content-Type: application/json" -d '{"patient_id": "patient123"}' http://localhost:3000/prescriptions/open_prescription


curl -X POST -H "Content-Type: application/json" -d '{"prescription_id": "<ID>", "medication_name": "ADVIL (Oral Liquid)", "dosage": "200mg", "frequency": "once daily"}' http://localhost:3000/prescriptions/add_medication


curl -X POST -H "Content-Type: application/json" -d '{"prescription_id": "<ID>"}' http://localhost:3000/prescriptions/close_prescription


# Test it using npm 

```npm test```



