import React from 'react';
import { Card } from 'react-bootstrap';
import '../../Pages/ContractStyle.css';

const CommissionDetails = ({ contract }) => {
    const { service_commission_id: commission } = contract;

    // Function to calculate percentage
    const calculatePercentage = (commissionValue, totalValue) => {
        if (!totalValue || totalValue <= 0) return 'N/A';
        return Math.round((commissionValue / totalValue) * 100);
    };

    const renderCommissions = () => {
        if (!commission) return <p>No commission data available.</p>;

        const roles = [
            { key: 'hodsale', label: 'HOD' },
            { key: 'salemanager', label: 'Manager' },
            { key: 'team_leader', label: 'Team Leader' },
        ];

        const withoutVat = commission.without_vat_commission;
        const brokerCommission = commission.broker_name_commission || 0;

        // Calculate broker's percentage first
        const brokerPercentage = calculatePercentage(brokerCommission, withoutVat);

        // Remaining commission value after deducting broker's commission
        const remainingCommissionValue = withoutVat - brokerCommission;

        return (
            <>
                {/* Broker Commission */}
                {commission.broker_name && (
                    <div className="single_lead_upper_container">
                        <h5 className="mutual_heading_class">{commission.broker_name}</h5>
                        <p className="mutual_class_color">Role: Broker</p>
                        <p className="mutual_class_color">Commission: {Math.round(brokerCommission)} AED</p>
                        <p className="mutual_class_color">Percentage: {brokerPercentage}%</p>
                    </div>
                )}

                {/* Other Roles Commission */}
                {roles
                    .filter((role) => commission?.[role.key]?.name && commission?.[`${role.key}commission`] > 0)
                    .map((role) => {
                        const roleCommissionValue = commission[`${role.key}commission`];
                        const rolePercentage = calculatePercentage(roleCommissionValue, remainingCommissionValue);

                        return (
                            <div key={role.key} className="single_lead_upper_container">
                                <h5 className="mutual_heading_class">{commission[role.key].name}</h5>
                                <p className="mutual_class_color">{commission[role.key].role}</p>
                                <p className="mutual_class_color">Commission: {roleCommissionValue} AED</p>
                                <p className="mutual_class_color">Percentage: {rolePercentage}%</p>
                            </div>
                        );
                    })}
            </>
        );
    };

    return (
        <Card className="lead-discussion-main-card-contract-log mutual_background_class">
            <Card.Body>
                <h4 className="mutual_class_color mb-0">Commission Details</h4>
                <div className="mt-2">
                    {renderCommissions()}
                </div>
            </Card.Body>
        </Card>
    );
};

export default CommissionDetails;
