import React, { useState } from "react";
import { useRef } from "react";
import "./styles.css";

function Main() {
  const [names, setNames] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [inputs, setInputs] = useState({
    amount: "",
    expenseName: "",
    paidBy: "",
    participants: [],
  });
  const [transactions, setTransactions] = useState([]);
  const [individualExpenses, setIndividualExpenses] = useState({});
  const [totalAmountSpent, setTotalAmountSpent] = useState(0); // New state to track total amount spent
  const amtRef = useRef(null);
  const pdRef = useRef(null);
  const expNameRef = useRef(null);

  const handleAddPerson = () => {
    const name = document.getElementById("name").value;
    if (name.trim() !== "") {
      setNames([...names, name]);
    }
    document.getElementById("name").value = "";
  };

  const handleInputChange = (event) => {
    const { id, value, type } = event.target;
    if (type === "checkbox") {
      const participants = [...inputs.participants];
      if (event.target.checked) {
        participants.push(id);
      } else {
        participants.splice(participants.indexOf(id), 1);
      }
      setInputs({ ...inputs, participants });
    } else {
      setInputs({ ...inputs, [id]: value });
    }
  };

  const handleAddExpense = () => {
    const { amount, expenseName, paidBy, participants } = inputs;
    if (
      amount &&
      expenseName &&
      paidBy &&
      participants.length > 0 &&
      participants.includes(paidBy)
    ) {
      const amountValue = parseFloat(amount);
      const share = (amountValue / participants.length).toFixed(2);
      const newExpenses = [...expenses];
      const newIndividualExpenses = { ...individualExpenses };

      participants.forEach((participant) => {
        const index = names.indexOf(participant);
        if (participant === paidBy) {
          newExpenses[index] =
            (newExpenses[index] || 0) + share * (participants.length - 1);
        } else {
          newExpenses[index] = (newExpenses[index] || 0) - share;
        }
        
        // Track total expenses, last expense category, and participants for the paying participant
        if (participant === paidBy) {
          if (!newIndividualExpenses[participant]) {
            newIndividualExpenses[participant] = {
              amount: 0,
              category: expenseName,
              participants: [],
            };
          }
          newIndividualExpenses[participant].amount += amountValue;
          newIndividualExpenses[participant].category = expenseName;
          newIndividualExpenses[participant].participants = participants;
        }
      });

      setExpenses(newExpenses);
      setIndividualExpenses(newIndividualExpenses);
      setTotalAmountSpent((prevTotal) => prevTotal + amountValue); // Update total amount spent
      generateTransactions(newExpenses);
      clr();
    } else {
      alert("Please enter valid values first");
    }
  };

  const generateTransactions = (balances) => {
    const transactionList = [];
    const creditors = [];
    const debtors = [];

    balances.forEach((balance, index) => {
      if (balance > 0) creditors.push({ name: names[index], amount: balance });
      if (balance < 0) debtors.push({ name: names[index], amount: -balance });
    });

    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      transactionList.push({
        payer: debtor.name,
        payee: creditor.name,
        amount: amount.toFixed(2),
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount === 0) i++;
      if (creditor.amount === 0) j++;
    }

    setTransactions(transactionList);
  };

  const clr = () => {
    setInputs({ amount: "", expenseName: "", paidBy: "", participants: [] });
    amtRef.current.value = "";
    pdRef.current.value = "";
    expNameRef.current.value = "";
  };

  const isAddExpenseDisabled = !(
    inputs.amount &&
    inputs.expenseName &&
    inputs.paidBy &&
    inputs.participants.length > 0 &&
    inputs.participants.includes(inputs.paidBy)
  );

  const [activeDiv, setActiveDiv] = useState("adperson");

  const handleButtonClick = (id) => {
    setActiveDiv(id);
  };

  return (
    <div className="main">
      <div className="btnm">
        <button className="btns" onClick={() => handleButtonClick("adperson")}>
          People
        </button>
        <button className="btns" onClick={() => handleButtonClick("expenses")}>
          Expenses
        </button>
        <button className="btns" onClick={() => handleButtonClick("summary")}>
          Summary
        </button>
      </div>

      <div className={`divs ${activeDiv === "adperson" ? "active" : ""}`}>
        <h1>Bills</h1>
        <h2>Add Persons</h2>
        <div>
          <h3>Enter person's name:</h3>
          <input type="text" id="name" placeholder="Enter Person Name" />
          <br />
          <br />
          <button className="btns" onClick={handleAddPerson}>
            Add Person
          </button>
        </div>
        <ol>
          {names.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ol>
      </div>

      <div className={`divs ${activeDiv === "expenses" ? "active" : ""}`}>
        <h2>Expenses</h2>
        <div>
          <h3>Enter expense amount:</h3>
          <input
            type="number"
            id="amount"
            value={inputs.amount}
            onChange={handleInputChange}
            ref={amtRef}
          />
        </div>
        <div>
          <h3>Expense Category:</h3>
          <input
            type="text"
            id="expenseName"
            value={inputs.expenseName}
            onChange={handleInputChange}
            ref={expNameRef}
            placeholder="E.g., Groceries, Dinner"
          />
        </div>
        <div>
          <h3>Paid by:</h3>
          <select
            id="paidBy"
            value={inputs.paidBy}
            onChange={handleInputChange}
            ref={pdRef}
          >
            <option value="">-- Select --</option>
            {names.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h3>Participating persons:</h3>
          {names.map((name, index) => (
            <div key={index}>
              <input
                type="checkbox"
                id={name}
                checked={inputs.participants.includes(name)}
                onChange={handleInputChange}
              />
              <label htmlFor={name}>{name}</label>
            </div>
          ))}
        </div>
        <button onClick={handleAddExpense} disabled={isAddExpenseDisabled}>
          Add Expense
        </button>
      </div>

      <div className={`divs ${activeDiv === "summary" ? "active" : ""}`}>
        <h2>Individual Expenditures</h2>
        <center>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Total Expenditure</th>
              <th>Last Expense Category</th>
              <th>Participants</th>
            </tr>
          </thead>
          <tbody>
            {names.map((name, index) => (
              <tr key={index}>
                <td>{name}</td>
                <td>
                  <i className="fas fa-rupee-sign"></i>{" "}
                  {(individualExpenses[name]?.amount || 0).toFixed(2)}
                </td>
                <td>
                  {individualExpenses[name]?.category || "N/A"}
                </td>
                <td>
                  {individualExpenses[name]?.participants.join(", ") || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </center>
        <h2>Total Amount Spent</h2>
        <p>
          <i className="fas fa-rupee-sign"></i> {totalAmountSpent.toFixed(2)}
        </p>

        <h2>Who owes whom</h2>
        <center>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>To Whom</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.payer}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.payee}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </center>
      </div>
    </div>
  );
}

export default Main;
