import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { FormState, CalculationResult } from '@/types/schema';

Font.register({
  family: 'Helvetica',
  fonts: [],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    color: '#1f2937',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 9,
    color: '#6b7280',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    backgroundColor: '#f3f4f6',
    padding: '4 6',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    width: '40%',
    color: '#6b7280',
  },
  value: {
    width: '60%',
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    padding: '5 6',
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: '4 6',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  tableRowBold: {
    backgroundColor: '#eff6ff',
  },
  cell: {
    fontSize: 8,
  },
  cellBold: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  col1: { width: '40%' },
  col2: { width: '30%', textAlign: 'right' },
  col3: { width: '30%', textAlign: 'right' },
  summaryCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: { fontSize: 9, color: '#1e40af' },
  summaryValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1e40af' },
  summaryProfit: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#16a34a' },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
  quoteTable: {
    marginBottom: 10,
  },
  quoteRow: {
    flexDirection: 'row',
    padding: '5 6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  quoteLabel: { width: '25%', fontFamily: 'Helvetica-Bold', fontSize: 9 },
  quotePerKg: { width: '37%', textAlign: 'right', fontSize: 9 },
  quoteTotal: { width: '38%', textAlign: 'right', fontSize: 9, fontFamily: 'Helvetica-Bold' },
});

function usd(val: number, dec = 4): string {
  return `$${val.toFixed(dec)}`;
}

function usdT(val: number): string {
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

import type { CompanyProfile } from '@/types/company';

interface Props {
  inputs: FormState;
  results: CalculationResult;
  company: CompanyProfile;
}

export default function PdfDocument({ inputs, results, company }: Props) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const costRows = [
    { label: 'EXW Price', perKg: results.exw_usd_per_kg, total: results.exw_usd_per_kg * results.total_net_weight_kg, bold: false },
    { label: 'Export Tax', perKg: results.export_tax_usd_per_kg, total: results.export_tax_usd_per_kg * results.total_net_weight_kg, bold: false },
    { label: 'Local Charges', perKg: results.local_costs_usd_per_kg, total: results.local_costs_usd_total, bold: false },
    { label: 'FOB Cost', perKg: results.fob_cost_per_kg, total: results.fob_cost_per_kg * results.total_net_weight_kg, bold: true },
    { label: 'Ocean Freight', perKg: results.ocean_freight_usd_per_kg, total: parseFloat(inputs.ocean_freight_usd) || 0, bold: false },
    { label: 'CFR Cost', perKg: results.cfr_cost_per_kg, total: results.cfr_cost_per_kg * results.total_net_weight_kg, bold: true },
    { label: 'Insurance', perKg: results.insurance_usd_per_kg, total: results.insurance_usd_per_kg * results.total_net_weight_kg, bold: false },
    { label: 'CIF Cost', perKg: results.cif_cost_per_kg, total: results.cif_cost_per_kg * results.total_net_weight_kg, bold: true },
  ];

  const profitPct = results.total_cost_usd > 0
    ? ((results.profit_usd / results.total_cost_usd) * 100).toFixed(1)
    : '0.0';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Export Price Quotation</Text>
          <Text style={styles.headerSub}>
            {company.company_name}{company.company_email ? ` · ${company.company_email}` : ''}{company.company_phone ? ` · ${company.company_phone}` : ''} · Date: {today}
          </Text>
        </View>

        {/* Product Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Product Name</Text>
            <Text style={styles.value}>{inputs.product_name || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>HS Code</Text>
            <Text style={styles.value}>{inputs.hs_code || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Container</Text>
            <Text style={styles.value}>{inputs.container_type} · {inputs.boxes_per_container || '0'} {inputs.packing_type}(s)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Net Weight</Text>
            <Text style={styles.value}>{results.total_net_weight_kg.toLocaleString()} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Gross Weight</Text>
            <Text style={styles.value}>{results.total_gross_weight_kg.toLocaleString()} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Port of Loading</Text>
            <Text style={styles.value}>{inputs.pol || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Port of Discharge</Text>
            <Text style={styles.value}>{inputs.pod || '—'}</Text>
          </View>
        </View>

        {/* Cost Build-Up */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Build-Up</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.col1]}>Component</Text>
              <Text style={[styles.tableHeaderCell, styles.col2]}>USD/kg</Text>
              <Text style={[styles.tableHeaderCell, styles.col3]}>Per Container</Text>
            </View>
            {costRows.map((row, i) => (
              <View
                key={row.label}
                style={[
                  styles.tableRow,
                  i % 2 !== 0 && !row.bold ? styles.tableRowAlt : {},
                  row.bold ? styles.tableRowBold : {},
                ]}
              >
                <Text style={[row.bold ? styles.cellBold : styles.cell, styles.col1]}>
                  {row.label}
                </Text>
                <Text style={[row.bold ? styles.cellBold : styles.cell, styles.col2]}>
                  {usd(row.perKg)}
                </Text>
                <Text style={[row.bold ? styles.cellBold : styles.cell, styles.col3]}>
                  {usdT(row.total)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quote Prices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quote Prices (with {inputs.profit_markup}% profit)</Text>
          <View style={styles.quoteTable}>
            <View style={[styles.tableHeader]}>
              <Text style={[styles.tableHeaderCell, styles.quoteLabel]}>Incoterm</Text>
              <Text style={[styles.tableHeaderCell, styles.quotePerKg]}>USD/kg</Text>
              <Text style={[styles.tableHeaderCell, styles.quoteTotal]}>Container Total</Text>
            </View>
            {[
              { term: `FOB ${inputs.pol}`, perKg: results.fob_quote_per_kg, total: results.fob_quote_per_kg * results.total_net_weight_kg },
              { term: `CFR ${inputs.pod}`, perKg: results.cfr_quote_per_kg, total: results.cfr_quote_per_kg * results.total_net_weight_kg },
              { term: `CIF ${inputs.pod}`, perKg: results.cif_quote_per_kg, total: results.total_revenue_usd },
            ].map((row, i) => (
              <View key={row.term} style={[styles.quoteRow, i % 2 !== 0 ? styles.tableRowAlt : {}]}>
                <Text style={styles.quoteLabel}>{row.term}</Text>
                <Text style={styles.quotePerKg}>{usd(row.perKg)}</Text>
                <Text style={styles.quoteTotal}>{usdT(row.total)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Revenue (CIF)</Text>
            <Text style={styles.summaryValue}>{usdT(results.total_revenue_usd)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Cost</Text>
            <Text style={styles.summaryValue}>{usdT(results.total_cost_usd)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Profit</Text>
            <Text style={styles.summaryProfit}>{usdT(results.profit_usd)} ({profitPct}%)</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This quotation is valid for 15 days. Generated by Export Price Calculator · {company.company_name || 'Export Price Calculator'}
        </Text>
      </Page>
    </Document>
  );
}
