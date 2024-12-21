import React from 'react';
import { Card, Image as BootstrapImage, Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import '../../Pages/ContractStyle.css';
import default_image from '../../Assets/default_image.jpg';
import { Link } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import { LuView } from "react-icons/lu";
const styles = StyleSheet.create({
    page: {
        padding: 20,
    },
    title: {
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#d7aa47',
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableCol: {
        width: '20%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#d7aa47',
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableCell: {
        fontSize: 10,
        textAlign: 'center',
    },
    image: {
        width: 40,
        height: 40,
        margin: 'auto',
        borderRadius: '50%',
    },
});

const CommissionDetails = ({ contract }) => {
    const { service_commission_id: commission } = contract;
    if (!commission) return <p className="mutual_class_color">No Commission Data Available.</p>;

    // Extract relevant commission details
    const commissionRows = Object.keys(commission)
        .filter((key) => {
            const isAmountKey = key.endsWith('_commission_amount');
            const amountValue = commission[key];
            return isAmountKey && amountValue > 0;
        })
        .map((key) => {
            const baseKey = key.replace('_commission_amount', '');
            const imageSrc = commission[baseKey]?.image
                ? `/images/${commission[baseKey]?.image}`
                : default_image;

            return {
                name: commission[baseKey]?.name || commission.broker_name || 'N/A',
                amount: Math.round(commission[key]),
                percentage: commission[`${baseKey}_commission_percentage`] || 0,
                image: imageSrc,
            };
        });

    return (
        <>
            {/* Service Details */}
            <Card className="lead-discussion-main-card-contract-log mutual_background_class mb-2">
                <Card.Body>
                    <h4 className="mutual_class_color mb-0 text-center">Service Details</h4>
                    <div className="service_detail_data mt-2">
                        {contract.products && contract.products.length > 0 ? (
                            contract.products.map((product) => (
                                <p key={product._id}>{`Service Name: ${product?.name}`}</p>
                            ))
                        ) : null}
                        <p className="mutual_class_color">
                            {contract?.lead_id?.company_Name || 'No Company Name'}
                        </p>
                        <p>
                            <span>Finance Amount: </span>
                            <span style={{ color: '#d7aa47' }}>
                                {`${commission.finance_amount || 0} AED`}
                            </span>
                        </p>
                    </div>

                    <div className="service_detail_data">
                        <p>
                            <span>Bank Commission: </span>
                            <span style={{ color: '#d7aa47' }}>
                                {`${commission.bank_commission || 0} AED`}
                            </span>
                        </p>
                        <p>
                            <span>Client Commission: </span>
                            <span style={{ color: '#d7aa47' }}>
                                {`${commission.customer_commission || 0} AED`}
                            </span>
                        </p>
                    </div>

                    <div className="service_detail_data">
                        <p>
                            <span>Total Revenue (with VAT 5%): </span>
                            <span style={{ color: '#d7aa47' }}>
                                {`${commission.with_vat_commission || 0} AED`}
                            </span>
                        </p>
                        <p>
                            <span>Total Revenue (without VAT 5%): </span>
                            <span style={{ color: '#d7aa47' }}>
                                {`${Math.round(commission.without_vat_commission || 0)} AED`}
                            </span>
                        </p>
                    </div>
                </Card.Body>
            </Card>

            {/* Commission Details */}
            <Card className="lead-discussion-main-card-contract-commission mutual_background_class">
                <Card.Body>
                    <div className="text-center" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                        <Link
                            to={`/contractcommissiondetails?contract=${encodeURIComponent(JSON.stringify(contract || {}))}`}
                        >
                            <LuView style={{ color: '#d7aa47', fontSize: '24px', cursor: 'pointer' }} />
                        </Link>
                    </div>
                    <div style={{ height: '100%', maxHeight: '250px', overflowY: 'auto' }}>
                        <Table
                            bordered
                            responsive
                            striped
                            hover
                            className="text-center"
                            style={{ border: '1px solid #d7aa47' }}
                        >
                            <thead style={{ backgroundColor: '#2d3134' }} className="sticky-top">
                                <tr>
                                    <th style={{ backgroundColor: '#d7aa47', color: 'white' }}>Name</th>
                                    <th style={{ backgroundColor: '#d7aa47', color: 'white' }}>Commission (%)</th>
                                    <th style={{ backgroundColor: '#d7aa47', color: 'white' }}>Commission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissionRows.map((row, index) => (
                                    <tr key={index}>
                                        <td style={{ backgroundColor: '#2d3134' }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={<Tooltip>{row.name}</Tooltip>}
                                                >
                                                    <BootstrapImage
                                                        src={row.image}
                                                        alt="User"
                                                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                                    />
                                                </OverlayTrigger>
                                                <span className="mutual_class_color">
                                                    {row.name.split(' ').slice(0, 2).join(' ') || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ backgroundColor: '#2d3134', color: 'white' }}>
                                            {`${row.percentage}%`}
                                        </td>
                                        <td style={{ backgroundColor: '#2d3134', color: 'white' }}>
                                            {`${row.amount} AED`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </>
    );
};
export default CommissionDetails;