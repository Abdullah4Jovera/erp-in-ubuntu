import React, { useState } from 'react';
import { Card, Image, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import default_image from '../../Assets/default_image.jpg';
import '../../Components/leadactivity.css';
import '../../Pages/ContractStyle.css';

const DealActivity = ({ deal = {} }) => {
    // Safely destructure properties with nullish checks
    const dealActivityLogs = deal?.deal_activity_logs || [];
    const leadActivityLogs = deal?.lead_id?.activity_logs || [];
    const contractActivityLogs = deal?.contract_id?.contract_activity_logs || [];


    // Tabs and their corresponding logs
    const tabs = {
        deal: dealActivityLogs,
        contract: contractActivityLogs,
        lead: leadActivityLogs,
    };

    const [activeTab, setActiveTab] = useState('deal'); // Default to 'deal'

    // Helper function to render activity logs
    const renderActivityLogs = (logs) => {
        if (!logs.length) {
            return <p className="no-activity-log">No Activity Log Available</p>;
        }

        return logs.map((logactivity, index) => {
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
                                    placement="top"
                                    overlay={
                                        <Tooltip id={`tooltip-${index}`}>
                                            {logactivity.user_id?.name || 'Unknown User'}
                                        </Tooltip>
                                    }
                                >
                                    <div style={{ display: 'inline-block', cursor: 'pointer' }}>
                                        <Image
                                            src={imageSrc}
                                            alt="User"
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
    };

    return (
        <Card body className="contract-main-card-activity-log mutual_background_class">
            {/* Toggle Buttons */}
            <div className="activity_toggle_buttons" style={{ marginBottom: '15px', textAlign: 'center' }}>
                <h4 className="mutual_class_color mb-0">Activity</h4>
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                    {Object.keys(tabs).map((tab) => (
                        <Button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                backgroundColor: activeTab === tab ? '#d7aa47' : '#6c757da2',
                                color: 'white',
                                border: 'none',
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Display Activity Logs */}
            <div style={{ maxHeight: '278px', overflowY: 'auto', paddingRight: '10px' }}>
                {renderActivityLogs(tabs[activeTab])}
            </div>
        </Card>
    );
};

export default DealActivity;
