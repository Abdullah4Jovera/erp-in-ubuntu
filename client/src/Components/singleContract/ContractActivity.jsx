import React, { useState } from 'react';
import { Card, Image, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import default_image from '../../Assets/default_image.jpg';
import '../../Components/leadactivity.css';
import '../../Pages/ContractStyle.css'

const ContractActivity = ({ contract }) => {
    const {
        contract_activity_logs: contractActivityLogs = [],
        lead_id: { activity_logs: leadActivityLogs = [] } = {}
    } = contract;

    const [activeTab, setActiveTab] = useState('contract'); // Default to 'contract' activity

    // Helper function to render activity logs
    const renderActivityLogs = (logs) =>
        logs.map((logactivity, index) => {
            console.log(logactivity.user_id.name, 'logactivity')
            const imageSrc = logactivity.user_id?.image
                ? `/images/${logactivity.user_id?.image}`
                : default_image;

            return (
                <Card className="activity-log mt-2" key={`${logactivity._id}-${index}`}>
                    <div className="activity-log-content">
                        <div
                            className="activity-log-header"
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <OverlayTrigger
                                    key={index}
                                    placement="top" // Change this to 'bottom', 'left', or 'right' as needed
                                    overlay={
                                        <Tooltip id={`tooltip-${index}`}>
                                            {logactivity.user_id?.name || 'Unknown User'}
                                        </Tooltip>
                                    }
                                >
                                    <div style={{ display: 'inline-block', cursor: 'pointer' }}>
                                        <Image
                                            src={imageSrc}
                                            alt="User Image"
                                            className="image_control_discussion"
                                        />
                                    </div>
                                </OverlayTrigger>

                                <div className="activity-log-info">
                                    <p className="log-type">
                                        {logactivity.log_type || 'No Log Type Available'}
                                    </p>
                                    <p className="log-remark" style={{ color: 'white' }}>
                                        {logactivity.remark
                                            ? logactivity.remark.length > 50
                                                ? `${logactivity.remark.substring(0, 50)}...`
                                                : logactivity.remark
                                            : 'No Remark Available'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="log-date">
                                    {new Date(logactivity.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            );
        });

    return (
        <Card body className="contract-main-card-activity-log  mutual_background_class">
            {/* Toggle Buttons */}
            <div className="activity_toggle_buttons" style={{ marginBottom: '15px', textAlign: 'center' }}>
                <h4 className="mutual_class_color mb-0">Activity</h4>
                <div style={{ display: 'flex', gap: '5px' }} >
                    <Button
                        onClick={() => setActiveTab('contract')}
                        style={{
                            backgroundColor: activeTab === 'contract' ? '#d7aa47' : '#6c757da2',
                            color: 'white',
                            border: 'none', // Optional, for a cleaner look
                            marginRight: '10px', // Add spacing if necessary
                        }}
                    >
                        Contract
                    </Button>
                    <Button
                        onClick={() => setActiveTab('lead')}
                        style={{
                            backgroundColor: activeTab === 'lead' ? '#d7aa47' : '#6c757da2',
                            color: 'white',
                            border: 'none', // Optional, for a cleaner look
                        }}
                    >
                        Lead
                    </Button>
                </div>
            </div>

            {/* Display Activity Logs Based on Active Tab */}
            {activeTab === 'contract' && contractActivityLogs.length > 0 ? (
                <div style={{ maxHeight: '278px', overflowY: 'auto', paddingRight: '10px' }}>
                    {renderActivityLogs(contractActivityLogs)}
                </div>
            ) : activeTab === 'lead' && leadActivityLogs.length > 0 ? (
                <div style={{ maxHeight: '278px', overflowY: 'auto', paddingRight: '10px' }}>
                    {renderActivityLogs(leadActivityLogs)}
                </div>
            ) : (
                <p className="no-activity-log">No Activity Log Available</p>
            )}
        </Card>
    );
};

export default ContractActivity;
