import React from 'react';
import { useLocation } from 'react-router-dom';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, } from '@react-pdf/renderer';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Image, Table } from 'react-bootstrap'
import JoveraLogoweb from '../../Assets/JoveraLogoweb.png'

// Helper function to filter and prepare the service commission data, including marketing fields
const getFilteredServiceCommissionData = (data) => {
    const excludedFields = [
        'created_by',
        'delstatus',
        'created_at',
        'updated_at',
        '_id',
        'contract_id',
    ];
    const generalData = [];
    const specificFieldsData = [];
    const marketingFields = [
        'marketing_one',
        'marketing_one_commission_percentage',
        'marketing_one_commission_amount',
        'marketing_two',
        'marketing_two_commission_percentage',
        'marketing_two_commission_amount',
        'marketing_three',
        'marketing_three_commission_percentage',
        'marketing_three_commission_amount',
        'marketing_four',
        'marketing_four_commission_percentage',
        'marketing_four_commission_amount'
    ];

    const filteredMarketingData = [];
    const specificFields = [
        'finance_amount',
        'bank_commission',
        'customer_commission',
        'with_vat_commission',
        'without_vat_commission',
    ];

    const softwareFields = [
        'developer_one',
        'developer_one_commission_percentage',
        'developer_one_commission_amount',
        'developer_two',
        'developer_two_commission_percentage',
        'developer_two_commission_amount',
        'developerthree',
        'developer_three_commission_percentage',
        'developer_three_commission_amount',
        'developer_four',
        'developer_four_commission_percentage',
        'developer_four_commission_amount'
    ];

    const filteredSoftwareTeamData = [];
    const telesalesFields = [
        'ts_agent',
        'tsagent_commission_percentage',
        'tsagent_commission_amount',
        'ts_team_leader',
        'ts_team_leader_commission_percentage',
        'ts_team_leader_commission_amount',
    ];

    const filteredTeleSalesData = [];
    const DubaiFields = [
        'dubai_manager',
        'dubai_manager_commission_percentage',
        'dubai_manager_commission_amount',
        'dubai_coordinator',
        'dubai_coordinator_commission_percentage',
        'dubai_coordinator_commission_amount',
        'dubaiteam_leader',
        'dubaiteam_leader_commission_percentage',
        'dubaiteam_leader_commission_amount',
        'dubaisale_agent',
        'dubaiteam_sale_agent_percentage',
        'dubaiteam_sale_agent_amount'
    ];

    const filteredDubaisData = [];
    const AjmanFields = [
        'ajman_manager',
        'ajman_manager_commission_percentage',
        'ajman_manager_commission_amount',
        'ajman_coordinator',
        'ajman_coordinator_commission_percentage',
        'ajman_coordinator_commission_amount',
        'ajman_team_leader',
        'ajman_team_leader_commission_percentage',
        'ajman_team_leader_commission_amount',
        'ajman_sale_agent',
        'ajman_sale_agent_percentage',
        'ajman_sale_agent_amount'
    ];

    const filteredAjmansData = [];
    const ThirdPartyFields = [
        'broker_name',
        'broker_name_commission_percentage',
        'broker_name_commission_amount',
    ];

    const filteredThirdPartyData = [];
    for (const key in data) {
        if (
            data[key] !== null &&
            data[key] !== 0 &&
            !excludedFields.includes(key)
        ) {
            // Check if the field is in specificFields, marketingFields, softwareFields, or telesalesFields
            if (specificFields.includes(key)) {
                specificFieldsData.push({ field: key, value: data[key] });
            } else if (marketingFields.includes(key)) {
                // Collect marketing fields with valid values
                filteredMarketingData.push({ field: key, value: data[key] });
            } else if (softwareFields.includes(key)) {
                // Collect software team fields with valid values
                filteredSoftwareTeamData.push({ field: key, value: data[key] });
            } else if (telesalesFields.includes(key)) {
                // Collect telesales fields with valid values
                filteredTeleSalesData.push({ field: key, value: data[key] });
            } else if (DubaiFields.includes(key)) {
                // Collect Dubai fields with valid values
                filteredDubaisData.push({ field: key, value: data[key] });
            }
            else if (AjmanFields.includes(key)) {
                // Collect Dubai fields with valid values
                filteredAjmansData.push({ field: key, value: data[key] });
            }
            else if (ThirdPartyFields.includes(key)) {
                // Collect Dubai fields with valid values
                filteredThirdPartyData.push({ field: key, value: data[key] });
            }
            else {
                // General data collection
                generalData.push({ field: key, value: data[key] });
            }
        }
    }
    return { generalData, specificFieldsData, filteredMarketingData, filteredSoftwareTeamData, filteredTeleSalesData, filteredDubaisData, filteredAjmansData, filteredThirdPartyData };
};

// Helper function to map field names to user-friendly labels
const fieldNameMapping = {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    e_id: 'Emirates ID',
    // Add marketing fields mappings
    marketing_one: 'Team Leader',
    marketing_one_commission_percentage: '%',
    marketing_one_commission_amount: 'Amount',
    marketing_two: 'Agent (1)',
    marketing_two_commission_percentage: '%',
    marketing_two_commission_amount: 'Amount',
    marketing_three: 'Agent (2)',
    marketing_three_commission_percentage: '%',
    marketing_three_commission_amount: 'Amount',
    marketing_four: 'Agent (3)',
    marketing_four_commission_percentage: '%',
    marketing_four_commission_amount: 'Amount',
    // Add Developer Fields
    developer_one: 'Manager',
    developer_one_commission_percentage: '%',
    developer_one_commission_amount: 'Amount',
    developer_two: 'Developer (1)',
    developer_two_commission_percentage: '%',
    developer_two_commission_amount: 'Amount',
    developerthree: 'Developer (2)',
    developer_three_commission_percentage: '%',
    developer_three_commission_amount: 'Amount',
    developer_four: 'Developer (3)',
    developer_four_commission_percentage: '%',
    developer_four_commission_amount: 'Amount',
    // Add Dubai Fields
    dubai_manager: 'Manager',
    dubai_manager_commission_percentage: '%',
    dubai_manager_commission_amount: 'Amount',
    dubai_coordinator: 'Coordinator',
    dubai_coordinator_commission_percentage: '%',
    dubai_coordinator_commission_amount: 'Amount',
    dubaiteam_leader: 'Team Leader',
    dubaiteam_leader_commission_percentage: '%',
    dubaiteam_leader_commission_amount: 'Amount',
    dubaisale_agent: 'Sale Agent',
    dubaiteam_sale_agent_percentage: '%',
    dubaiteam_sale_agent_amount: 'Amount',
    // Add Ajman Fields
    ajman_manager: 'Manager',
    ajman_manager_commission_percentage: '%',
    ajman_manager_commission_amount: 'Amount',
    ajman_coordinator: 'Coordinator',
    ajman_coordinator_commission_percentage: '%',
    ajman_coordinator_commission_amount: 'Amount',
    ajman_team_leader: 'Team Leader',
    ajman_team_leader_commission_percentage: '%',
    ajman_team_leader_commission_amount: 'Amount',
    ajman_sale_agent: 'Sales Agent',
    ajman_sale_agent_percentage: '%',
    ajman_sale_agent_amount: 'Amount',
    // Tele Sales Agent
    ts_agent: ' Agent',
    tsagent_commission_percentage: '%',
    tsagent_commission_amount: 'Amount',
    ts_team_leader: 'Team Leader',
    ts_team_leader_commission_percentage: '%',
    ts_team_leader_commission_amount: 'Amount',
    // Broker
    broker_name: 'Broker Name',
    broker_name_commission_percentage: '%',
    broker_name_commission_amount: 'Amount',

};

const ContractCommissionDetails = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const contract = JSON.parse(queryParams.get('contract') || '{}');
    const fields = ['name', 'email', 'phone', 'e_id'];

    const { generalData, specificFieldsData, filteredMarketingData, filteredSoftwareTeamData, filteredTeleSalesData, filteredDubaisData, filteredAjmansData, filteredThirdPartyData } = getFilteredServiceCommissionData(
        contract.service_commission_id || {}
    );

    return (
        <div
            className="contract-details-container"
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                padding: '20px',
                backgroundColor: '#000',
                fontFamily: 'Arial, sans-serif',
            }}
        >
            <div style={{ width: '100%', maxWidth: "800px", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', }} >

                <div style={{ display: 'flex', justifyContent: 'center' }} >
                    <Image src={JoveraLogoweb} alt='JoveraLogoweb' style={{ maxWidth: '25%' }} />
                </div>
                <h1
                    className="mutual_class_color text-center mt-3"
                    style={{ color: '#fff' }}
                >
                    Service Application Form
                </h1>

                {/* Download Button */}
                <PDFDownloadLink
                    document={<ContractPDF contract={contract} generalData={generalData} specificFieldsData={specificFieldsData} filteredMarketingData={filteredMarketingData} filteredSoftwareTeamData={filteredSoftwareTeamData} filteredTeleSalesData={filteredTeleSalesData} filteredDubaisData={filteredDubaisData} filteredAjmansData={filteredAjmansData} filteredThirdPartyData={filteredThirdPartyData} />}
                    fileName="contract_commission_details.pdf"
                    style={{ color: 'black', textDecoration: 'none' }}
                >
                    {({ loading }) => (loading ? <AiOutlineLoading3Quarters style={{ color: '#d7aa47' }} /> : 'Download PDF')}
                </PDFDownloadLink>

                {/* Contract Details Table */}
                <div
                    className="contract-details-table-container"
                    style={{
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        width: '80%',
                        maxWidth: '800px',
                        marginBottom: '2px',
                    }}
                >
                    <h2 style={{ color: '#333', fontSize: '18px' }}>Client Details</h2>
                    <Table striped bordered hover responsive>
                        <thead style={{ backgroundColor: '#d7aa47' }}>
                            <tr>
                                {fields.map((field) => (
                                    <th
                                        key={field}
                                        style={{
                                            color: '#fff',
                                            backgroundColor: '#d7aa47',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {fieldNameMapping[field] || field.replace(/_/g, ' ')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {fields.map((field) => (
                                    <td
                                        key={field}
                                        style={{
                                            padding: '10px',
                                            borderBottom: '1px solid #ddd',
                                        }}
                                    >
                                        {typeof contract.client_id?.[field] === 'object'
                                            ? contract.client_id?.[field]?.name || 'N/A'
                                            : contract.client_id?.[field] || 'N/A'}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </Table>
                </div>

                {/* Service Commission Table */}
                {specificFieldsData.length > 0 && (
                    <DetailsTable
                        title="Service Details"
                        data={specificFieldsData}
                    />
                )}

                {/* General Commission Table */}
                {generalData.length > 0 && (
                    <DetailsTable
                        title="Commission Details"
                        data={generalData}
                    />
                )}


                {/* Marketing Commission Tables */}
                {filteredMarketingData.length > 0 && (
                    <DetailsTable
                        title="Marketing Details"
                        data={filteredMarketingData}
                    />
                )}

                {/* IT Team Commission Tables */}
                {filteredSoftwareTeamData.length > 0 && (
                    <DetailsTable
                        title="Software Details"
                        data={filteredSoftwareTeamData}
                    />
                )}

                {/* IT Team Commission Tables */}
                {filteredTeleSalesData.length > 0 && (
                    <DetailsTable
                        title="TeleSales Details"
                        data={filteredTeleSalesData}
                    />
                )}

                {/* Dubai Team Commission Tables */}
                {filteredDubaisData.length > 0 && (
                    <DetailsTable
                        title="Dubai"
                        data={filteredDubaisData}
                    />
                )}

                {/* Ajman Team Commission Tables */}
                {filteredAjmansData.length > 0 && (
                    <DetailsTable
                        title="Ajman"
                        data={filteredAjmansData}
                    />
                )}

                {/* Third PartyCommission Tables */}
                {filteredThirdPartyData.length > 0 && (
                    <DetailsTable
                        title="Third Party"
                        data={filteredThirdPartyData}
                    />
                )}
            </div>

        </div>
    );
};
const TableHeading = ['Name', '%', 'Amount'];
const DetailsTable = ({ title, data }) => {
    return (
        <div
            style={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                width: '80%',
                maxWidth: '800px',
                marginBottom: '2px',
            }}
        >
            <h2 style={{ marginBottom: '10px', color: '#333', fontSize: '18px' }}>{title}</h2>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th
                            // key={index}
                            style={{ backgroundColor: '#d7aa47', color: '#fff' }}
                        >
                            Title
                        </th>
                        <th
                            // key={index}
                            style={{ backgroundColor: '#d7aa47', color: '#fff' }}
                        >
                            Value
                        </th>

                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => {
                        const field = item?.field?.replace(/_/g, ' ') || 'N/A'; // Default replacement if no mapping exists
                        const displayName = fieldNameMapping[item?.field] || field;

                        return (
                            <tr key={index}>
                                <td style={{ textTransform: 'capitalize' }}>
                                    {displayName ? displayName : 'N/A'}
                                </td>
                                <td>
                                    {item?.value && typeof item?.value === 'object'
                                        ? item?.value?.name || 'N/A'
                                        : item?.value || 'N/A'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>

        </div>
    )
};

const ContractPDF = ({ contract, generalData, specificFieldsData, filteredMarketingData, filteredSoftwareTeamData, filteredTeleSalesData, filteredDubaisData, filteredAjmansData, filteredThirdPartyData }) => {
    const styles = StyleSheet.create({
        page: {
            flexDirection: 'column',
            backgroundColor: '#fff',
            padding: 20,
        },
        section: {
            marginBottom: 20,
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
        },
        tableHeader: {
            borderBottom: '2px solid #ddd',
            padding: 10,
            backgroundColor: '#f7f7f7',
            textAlign: 'left',
            fontSize: 12,
        },
        tableCell: {
            borderBottom: '1px solid #ddd',
            padding: 10,
            fontSize: 12,
        },
        imageContainer: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 20, // Adds margin to separate image from text
        },
        logoImage: {
            maxWidth: '25%', // Restrict image size to 25%
        },

    });

    // Table component for rendering the data
    const Table = ({ data }) => (
        <View style={styles?.table}>
            <View style={[styles?.tableRow, styles?.tableHeader]}>
                <Text style={[styles?.tableCell, { backgroundColor: '#d7aa47', color: '#fff' }]}>Title</Text>
                <Text style={[styles?.tableCell, { backgroundColor: '#d7aa47', color: '#fff' }]}>Value</Text>
            </View>
            {data.map((item, index) => {
                const field = item.field.replace(/_/g, ' '); // Default replacement if no mapping exists
                const displayName = fieldNameMapping[item?.field] || field;

                return (
                    <View key={index} style={styles?.tableRow}>
                        <Text style={styles?.tableCell}>{displayName && displayName}</Text>
                        <Text style={styles?.tableCell}>
                            {typeof item.value === 'object' ? item?.value?.name || 'N/A' : item?.value}
                        </Text>
                    </View>
                );
            })}
        </View>
    );


    return (
        <Document>
            <Page style={styles?.page}>
                {/* Logo Section */}
                <View style={styles?.imageContainer}>
                    <Image src={JoveraLogoweb} alt='Jovera Logo' style={styles.logoImage} />
                </View>

                <View style={styles?.section}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Service Application Form</Text>
                </View>

                <View style={styles?.section}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Client Details</Text>
                    <Table data={contract.client_id ? Object.entries(contract.client_id).map(([field, value]) => ({ field, value })) : []} />
                </View>

                <View style={styles?.section}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Service Details</Text>
                    <Table data={specificFieldsData} />
                </View>

                <View style={styles?.section}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Commission Details</Text>
                    <Table data={generalData} />
                </View>

                <View style={styles?.section}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Marketing</Text>
                    <Table data={filteredMarketingData} />
                </View>

                <View style={styles?.section}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>IT</Text>
                    <Table data={filteredSoftwareTeamData} />
                </View>

                <View style={styles?.section}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Tele Sales</Text>
                    <Table data={filteredTeleSalesData} />
                </View>

                <View style={styles?.section}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Dubai</Text>
                    <Table data={filteredDubaisData} />
                </View>

                <View style={styles?.section}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Ajman</Text>
                    <Table data={filteredAjmansData} />
                </View>

                <View style={styles?.section}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Third Party</Text>
                    <Table data={filteredThirdPartyData} />
                </View>
            </Page>
        </Document>
    );
};

export default ContractCommissionDetails;
