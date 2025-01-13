import React from 'react';
import { Card } from 'react-bootstrap';
import '../../Pages/ContractStyle.css';

const ServiceDetails = ({ contract }) => {
    return (
        <>
            <Card className="lead-discussion-main-card-contract-log mutual_background_class">
                <Card.Body>
                    <h4 className="mutual_class_color mb-0 text-center">Service Details</h4>
                    <div className="service_detail_data mt-2">
                        {contract.products && contract.products.length > 0 ? (
                            contract.products.map((product) => (
                                <p key={product._id}>
                                    {`Service Name: ${product?.name}`}
                                </p>
                            ))
                        ) : (
                            null
                        )}
                        {contract?.lead_id?.company_Name ? (
                            <p className="mutual_class_color">
                                {contract?.lead_id?.company_Name}
                            </p>
                        ) : (
                            <p>No Company Name</p>
                        )}
                        <p>
                            <span>Finance Amount: </span>
                            <span style={{ color: '#d7aa47' }}>
                                {`${contract.service_commission_id.finance_amount} AED`}
                            </span>
                        </p>
                    </div>

                    <div className="service_detail_data">
                        <p>
                            <span>Bank Commission: </span>
                            <span style={{ color: '#d7aa47' }}>
                                {`${contract.service_commission_id.bank_commission} AED`}
                            </span>
                        </p>
                        <p>
                            <span>Client Commission: </span>
                            <span style={{ color: '#d7aa47' }}>
                                {`${contract.service_commission_id.customer_commission} AED`}
                            </span>
                        </p>
                    </div>

                    <div className="service_detail_data">
                        <p>
                            <span>Total Revenue (with VAT 5%): </span>
                            <span style={{ color: '#d7aa47' }}>
                                {`${contract.service_commission_id.with_vat_commission} AED`}
                            </span>
                        </p>
                        <p>
                            <span>Total Revenue (without VAT 5%): </span>
                            <span style={{ color: '#d7aa47' }}>
                                {`${Math.round(contract.service_commission_id.without_vat_commission)} AED`}
                            </span>
                        </p>
                    </div>
                </Card.Body>
            </Card>
        </>
    );
};

export default ServiceDetails;
