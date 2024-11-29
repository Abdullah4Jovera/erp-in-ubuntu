import React from 'react'
import { Container, Row, Col, Card, Spinner, Image } from 'react-bootstrap';
import '../../Pages/ContractStyle.css'
const ServiceDetails = ({ contract }) => {
    return (
        <>
            <Card className="lead-discussion-main-card-contract-log mutual_background_class">
                <Card.Body>
                    <h4 className="mutual_class_color mb-0">Service Details</h4>
                    <div className='service_detail_data mt-2' >
                        {contract.products && contract.products.length > 0 ? (
                            contract.products.map((product) => (
                                <p key={product._id}>
                                    {`Service Name: ${product?.name}`}
                                </p>
                            ))
                        ) : (
                            <h4>No Products Available</h4>
                        )}
                        <p> {`Finance_Amount : ${contract.service_commission_id.finance_amount} AED`} </p>
                    </div>

                    <div className='service_detail_data'>
                        <p> {`Bank Commission : ${contract.service_commission_id.bank_commission} AED`} </p>
                        <p> {`Client Commission : ${contract.service_commission_id.customer_commission} AED`} </p>
                    </div>

                    <div className='service_detail_data'>
                        <p> {`Total Revenue(with vat 5%) : ${contract.service_commission_id.with_vat_commission} AED`} </p>
                        <p>  {`Total Revenue (without VAT 5%): ${Math.round(contract.service_commission_id.without_vat_commission)} AED`} </p>
                    </div>
                </Card.Body>
            </Card>
        </>
    )
}

export default ServiceDetails