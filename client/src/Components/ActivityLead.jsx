import React from 'react';
import { Card, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import default_image from '../Assets/default_image.jpg';
import './leadactivity.css';

const ActivityLead = ({ singleLead, rtl }) => {
    const { activity_logs = [] } = singleLead;

    return (
        <Card body className="lead-discussion-main-card-activity-log mt-2 mutual_background_class">
            <h4 className='mutual_class_color'>
                {rtl === 'true' ? 'النشاط' : 'Activity'}
            </h4>
            {activity_logs.length > 0 ? (
                <div style={{ maxHeight: '286px', overflowY: 'auto', paddingRight: '10px' }}>
                    {/* Reverse the activity logs array to display the most recent activities first */}
                    {activity_logs.slice().reverse().map((logactivity, index) => {
                        const imageSrc = logactivity.user_id?.image
                            ? `/images/${logactivity.user_id?.image}`
                            : default_image;

                        // Create a tooltip with the user's name
                        const renderTooltip = (props) => (
                            <Tooltip id="button-tooltip" {...props}>
                                {logactivity.user_id?.name || (rtl === 'true' ? 'مستخدم غير معروف' : 'Unknown User')}
                            </Tooltip>
                        );

                        return (
                            <Card className="activity-log mt-2" key={logactivity._id}>
                                <div className="activity-log-content" style={{
                                    direction: rtl !== 'true' ? 'ltr' : 'ltr'
                                }} >
                                    <div className="activity-log-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', }}>
                                            <OverlayTrigger
                                                placement="top"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={renderTooltip}
                                            >
                                                <Image
                                                    src={imageSrc}
                                                    alt="User Image"
                                                    className="image_control_discussion"
                                                />
                                            </OverlayTrigger>
                                            <div className="activity-log-info">
                                                <p className="log-type">
                                                    {logactivity.log_type || (rtl === 'true' ? 'لا يوجد نوع سجل متاح' : 'No Log Type Available')}
                                                </p>
                                                <div className="log-remark-container">
                                                    <p
                                                        className="log-remark"
                                                        style={{ color: 'white', cursor: 'pointer', position: 'relative' }}
                                                    >
                                                        {logactivity.remark
                                                            ? logactivity.remark.length > 50
                                                                ? `${logactivity.remark.substring(0, 50)}...`
                                                                : logactivity.remark
                                                            : (rtl === 'true' ? 'لا توجد ملاحظات متاحة' : 'No Remark Available')}
                                                    </p>
                                                    {logactivity.remark && logactivity.remark.length > 50 && (
                                                        <span className="tooltip">{logactivity.remark}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="log-date">
                                                {new Date(logactivity.created_at).toLocaleDateString(rtl === 'true' ? 'ar-EG' : 'en-US', {
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
                    })}
                </div>
            ) : (
                <p className="no-activity-log">
                    {rtl === 'true' ? 'لا توجد سجلات نشاط متاحة' : 'No Activity Log Available'}
                </p>
            )}
        </Card>

    );
};

export default ActivityLead;
