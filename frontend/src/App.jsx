import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';
import Login from './features/autehtication/pages/Login';
import Register from './features/autehtication/pages/Register';
import CompanyCreate from './features/company/pages/CompanyCreate';
import GstRegistration from './features/company/pages/GstRegistration';
import LedgerCreate from './features/accounting/pages/LedgerCreate';
import CurrencyCreate from './features/accounting/pages/CurrencyCreate';
import StockItemCreate from './features/inventory/pages/StockItemCreate';
import UnitCreate from './features/inventory/pages/UnitCreate';
import SelectCompany from './features/company/pages/SelectCompany';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Gateway from './features/gateway/Gateway';
import AlterList from './components/common/AlterList';

import RegistryMonthView from './features/reports/pages/RegistryMonthView';
import RegistryVoucherView from './features/reports/pages/RegistryVoucherView';
import LedgerReport from './features/reports/pages/LedgerReport';

import SalesVoucher from './features/Vouchers/SalesVoucher';
import PurchaseVoucher from './features/Vouchers/PurchaseVoucher';
import ReceiptVoucher from './features/Vouchers/ReceiptVoucher';
import PaymentVoucher from './features/Vouchers/PaymentVoucher';
import ContraVoucher from './features/Vouchers/ContraVoucher';
import JournalVoucher from './features/Vouchers/JournalVoucher';

import Daybook from './features/Reports/Daybook';
import LedgerVouchers from './features/Reports/LedgerVouchers';
import SalesModule from './features/Sales/SalesModule';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/select-company" element={<SelectCompany />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Gateway />} />
            <Route path="company/create" element={<CompanyCreate />} />
            <Route path="company/edit/:id" element={<CompanyCreate />} />
            <Route path="company/alter" element={<AlterList title="Company" endpoint="/api/companies" editPathPrefix="/company/edit" displayField="name" />} />
            
            <Route path="company/gst/:id" element={<GstRegistration />} />
            <Route path="company/gst" element={<AlterList title="Company GST" endpoint="/api/companies" editPathPrefix="/company/gst" displayField="name" />} />
            <Route path="company/gst/alter" element={<AlterList title="Company GST" endpoint="/api/companies" editPathPrefix="/company/gst" displayField="name" />} />

            <Route path="masters/ledger/create" element={<LedgerCreate />} />
            <Route path="masters/ledger/edit/:id" element={<LedgerCreate />} />
            <Route path="masters/ledger/alter" element={<AlterList title="Ledger" endpoint="/api/ledgers" editPathPrefix="/masters/ledger/edit" displayField="name" secondaryField="alias" />} />
            
            <Route path="masters/currency/create" element={<CurrencyCreate />} />
            <Route path="masters/currency/edit/:id" element={<CurrencyCreate />} />
            <Route path="masters/currency/alter" element={<AlterList title="Currency" endpoint="/api/currencies" editPathPrefix="/masters/currency/edit" displayField="symbol" secondaryField="formalName" />} />

            <Route path="inventory/item/create" element={<StockItemCreate />} />
            <Route path="inventory/item/edit/:id" element={<StockItemCreate />} />
            <Route path="inventory/item/alter" element={<AlterList title="Stock Item" endpoint="/api/stockitems" editPathPrefix="/inventory/item/edit" displayField="name" />} />
            
            <Route path="inventory/unit/create" element={<UnitCreate />} />
            <Route path="inventory/unit/edit/:id" element={<UnitCreate />} />
            <Route path="inventory/unit/alter" element={<AlterList title="Unit" endpoint="/api/units" editPathPrefix="/inventory/unit/edit" displayField="symbol" secondaryField="formalName" />} />
            
            {/* Vouchers */}
            <Route path="vouchers/sales" element={<SalesVoucher />} />
            <Route path="vouchers/purchase" element={<PurchaseVoucher />} />
            <Route path="vouchers/receipt" element={<ReceiptVoucher />} />
            <Route path="vouchers/payment" element={<PaymentVoucher />} />
            <Route path="vouchers/contra" element={<ContraVoucher />} />
            <Route path="vouchers/journal" element={<JournalVoucher />} />

            {/* Account Book */}
            <Route path="reports/daybook" element={<Daybook />} />
            <Route path="reports/ledger/:id" element={<LedgerVouchers />} />
            
            <Route path="reports/account-book/ledger" element={<LedgerReport />} />
            <Route path="reports/account-book/sales-module" element={<SalesModule />} />
            <Route path="reports/account-book/sales-registry" element={<RegistryMonthView />} />
            <Route path="reports/account-book/sales-registry/vouchers" element={<RegistryVoucherView />} />
            <Route path="reports/account-book/purchase-registry" element={<RegistryMonthView />} />
            <Route path="reports/account-book/purchase-registry/vouchers" element={<RegistryVoucherView />} />
            <Route path="reports/account-book/debit-note" element={<RegistryMonthView />} />
            <Route path="reports/account-book/debit-note/vouchers" element={<RegistryVoucherView />} />
            <Route path="reports/account-book/credit-note" element={<RegistryMonthView />} />
            <Route path="reports/account-book/credit-note/vouchers" element={<RegistryVoucherView />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
