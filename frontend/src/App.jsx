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
import GatewayOfTally from './features/Dashboard/GatewayOfTally';
import AlterList from './components/common/AlterList';
import GroupCreate from './features/Masters/GroupCreate';
import StockGroupCreate from './features/Masters/StockGroupCreate';

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
import PurchaseModule from './features/Purchase/PurchaseModule';
import GSTR1Report from './features/GST/GSTR1Report';
import GSTR2Report from './features/GST/GSTR2Report';
import GSTR3BReport from './features/GST/GSTR3BReport';
import BankReconciliation from './features/Banking/BankReconciliation';
import ManufacturingJournal from './features/Vouchers/ManufacturingJournal';
import EmployeeMaster from './features/Payroll/EmployeeMaster';
import PayrollVoucher from './features/Payroll/PayrollVoucher';
import TrialBalance from './features/Reports/TrialBalance';
import ProfitAndLoss from './features/Reports/ProfitAndLoss';
import BalanceSheet from './features/Reports/BalanceSheet';
import PurchaseRegister from './features/Purchase/PurchaseRegister';
import PayrollLanding from './features/Payroll/PayrollLanding';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/select-company" element={<SelectCompany />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<GatewayOfTally />} />
            <Route path="company/create" element={<CompanyCreate />} />
            <Route path="company/edit/:id" element={<CompanyCreate />} />
            <Route path="company/alter" element={<AlterList title="Company" endpoint="/api/companies" editPathPrefix="/company/edit" displayField="name" />} />
            
            <Route path="company/gst/:id" element={<GstRegistration />} />
            <Route path="company/gst" element={<AlterList title="Company GST" endpoint="/api/companies" editPathPrefix="/company/gst" displayField="name" />} />
            <Route path="company/gst/alter" element={<AlterList title="Company GST" endpoint="/api/companies" editPathPrefix="/company/gst" displayField="name" />} />

            <Route path="masters/ledger/create" element={<LedgerCreate />} />
            <Route path="masters/ledger/edit/:id" element={<LedgerCreate />} />
            <Route path="masters/ledger/alter" element={<AlterList title="Ledger" endpoint="/api/ledgers" editPathPrefix="/masters/ledger/edit" displayField="name" secondaryField="alias" />} />
            <Route path="masters/group/create" element={<GroupCreate />} />
            <Route path="inventory/group/create" element={<StockGroupCreate />} />
            
            {/* Payroll Masters */}
            <Route path="payroll/employee" element={<EmployeeMaster />} />

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
            <Route path="reports/financial/balance-sheet" element={<BalanceSheet />} />
            
            <Route path="vouchers/sales" element={<SalesVoucher />} />
            <Route path="vouchers/purchase" element={<PurchaseVoucher />} />
            <Route path="vouchers/receipt" element={<ReceiptVoucher />} />
            <Route path="vouchers/payment" element={<PaymentVoucher />} />
            <Route path="vouchers/contra" element={<ContraVoucher />} />
            <Route path="vouchers/journal" element={<JournalVoucher />} />
            <Route path="vouchers/manufacturing" element={<ManufacturingJournal />} />
            
            {/* Payroll */}
            <Route path="payroll" element={<PayrollLanding />} />

            <Route path="vouchers/receipt" element={<ReceiptVoucher />} />
            <Route path="vouchers/payment" element={<PaymentVoucher />} />
            <Route path="vouchers/contra" element={<ContraVoucher />} />
            <Route path="vouchers/journal" element={<JournalVoucher />} />
            <Route path="vouchers/manufacturing" element={<ManufacturingJournal />} />
            <Route path="vouchers/payroll" element={<PayrollVoucher />} />

            {/* Banking */}
            <Route path="banking/reconciliation" element={<BankReconciliation />} />

            {/* Account Book */}
            <Route path="reports/daybook" element={<Daybook />} />
            <Route path="reports/ledger/:id" element={<LedgerVouchers />} />
            
            <Route path="reports/account-book/ledger" element={<LedgerReport />} />
            <Route path="reports/account-book/sales-module" element={<SalesModule />} />
            <Route path="reports/account-book/purchase-module" element={<PurchaseModule />} />
            <Route path="reports/account-book/sales-registry" element={<RegistryMonthView />} />
            <Route path="reports/account-book/sales-registry/vouchers" element={<RegistryVoucherView />} />
            <Route path="reports/account-book/purchase-registry" element={<RegistryMonthView />} />
            <Route path="reports/account-book/purchase-registry/vouchers" element={<RegistryVoucherView />} />
            <Route path="reports/account-book/debit-note" element={<RegistryMonthView />} />
            <Route path="reports/account-book/debit-note/vouchers" element={<RegistryVoucherView />} />
            <Route path="reports/account-book/credit-note" element={<RegistryMonthView />} />
            <Route path="reports/account-book/credit-note/vouchers" element={<RegistryVoucherView />} />

            {/* Financial Reports */}
            <Route path="reports/financial/trial-balance" element={<TrialBalance />} />
            <Route path="reports/financial/profit-loss" element={<ProfitAndLoss />} />
            <Route path="reports/financial/balance-sheet" element={<BalanceSheet />} />

            {/* GST Reports */}
            <Route path="reports/gst/gstr1" element={<GSTR1Report />} />
            <Route path="reports/gst/gstr2" element={<GSTR2Report />} />
            <Route path="reports/gst/gstr3b" element={<GSTR3BReport />} />
            <Route path="reports/purchase-register" element={<PurchaseRegister />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
