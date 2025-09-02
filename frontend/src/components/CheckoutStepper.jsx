// src/components/CheckoutStepper.jsx
import React from 'react';

const steps = ['Cart', 'Checkout', 'Confirmation'];

export default function CheckoutStepper({ currentStep }) {
  return (
    <div className="d-flex justify-content-center mb-4">
      {steps.map((step, index) => (
        <div key={step} className="text-center mx-3">
          <div
            className={`circle-step ${currentStep === index ? 'active' : ''}`}
          >
            {index + 1}
          </div>
          <small>{step}</small>
        </div>
      ))}
    </div>
  );
}
