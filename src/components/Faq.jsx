import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

// styles
import "./faq.css";

const faqData = [
  {
    question: "What documents do I need to rent a car?",
    answer:
      "You will need a valid driver's license, a national identity card or passport, and a valid credit card in the driver's name.",
  },
  {
    question: "What is the minimum age to rent a car?",
    answer:
      "The minimum age to rent a vehicle is 21 years old. Drivers under the age of 25 may be subject to a young driver surcharge.",
  },
  {
    question: "Can I add an additional driver?",
    answer:
      "Yes, you can add additional drivers to your rental agreement. They must also meet the minimum age and license requirements.",
  },
  {
    question: "What is your fuel policy?",
    answer:
      "Our standard policy is full-to-full, meaning you will receive the car with a full tank of fuel and are expected to return it full. Other options may be available.",
  },
  {
    question: "What happens if I have a breakdown?",
    answer:
      "In the unlikely event of a breakdown, please contact our 24/7 roadside assistance. The number is provided in your rental agreement.",
  },
];

const FaqItem = ({ faq, index, toggleFAQ, active }) => {
  return (
    <div className={`faq-item ${active ? "active" : ""}`}>
      <div className="faq-question" onClick={() => toggleFAQ(index)}>
        <h3>{faq.question}</h3>
        <span>{active ? <FaMinus /> : <FaPlus />}</span>
      </div>
      <div className="faq-answer">
        <p>{faq.answer}</p>
      </div>
    </div>
  );
};

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq">
      <div className="container">
        <h1>Frequently Asked Questions</h1>
        <div className="faq-list">
          {faqData.map((faq, index) => (
            <FaqItem
              key={index}
              faq={faq}
              index={index}
              toggleFAQ={toggleFAQ}
              active={activeIndex === index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
