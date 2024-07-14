import './App.css';
import LoginButton from './LoginButton';
import InvoiceList from './InvoiceList';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Invoice Reminder System</h1>
        <LoginButton />
        <InvoiceList />
      </header>
    </div>
  );
}

export default App;