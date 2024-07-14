import { useState, useEffect } from 'react';
import axios from 'axios';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const fetchInvoices = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/invoices');
            setInvoices(response.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
        };

        fetchInvoices();
    }, []);

    return (
        <div>
            <h2>Invoice List</h2>
            <ul>
                {invoices.map((invoice) => (
                <li key={invoice.id}>
                    ID: {invoice.id}, Amount: ${invoice.amount}, Due Date: {invoice.dueDate}, Recipient: {invoice.recipient}
                </li>
                ))}
        </ul>
        </div>
    );
};

export default InvoiceList;