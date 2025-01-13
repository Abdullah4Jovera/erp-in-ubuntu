import React from 'react';
import { Card, Table, OverlayTrigger, Tooltip, Image } from 'react-bootstrap';
import default_image from '../Assets/default_image.jpg';

const ContractUsers = ({ contract }) => {
    const { selected_users } = contract;
    // Roles to exclude
    const excludedRoles = ["CEO", "MD", "Admin", "Super Admin", "Marketing", "Developer"];

    // Tooltip function
    const renderTooltip = (props, name) => (
        <Tooltip id="user-tooltip" {...props}>
            {name}
        </Tooltip>
    );

    // Filter users excluding specific roles
    const filteredUsers = selected_users?.filter(
        (user) => !excludedRoles.includes(user?.role)
    );

    return (
        <Card
            className="mt-2 lead_discussion_main_card_user mutual_background_class"
            style={{
                padding: '10px',
                height: '100%',
                maxHeight: '240px',
                minHeight: '250px',
                overflowY: 'hidden',
            }}
        >
            <Table bordered responsive striped hover className="lead_user_class">
                <tbody>
                    {filteredUsers && filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                            const imageSrc = user?.image
                                ? `/images/${user.image}`
                                : default_image;

                            return (
                                <tr key={user._id} style={{ height: '40px' }}>
                                    <td
                                        style={{
                                            verticalAlign: 'middle',
                                            backgroundColor: '#2d3134',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '8px',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <OverlayTrigger
                                                placement="top"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={(props) =>
                                                    renderTooltip(props, user.name || 'N/A')
                                                }
                                            >
                                                <Image
                                                    src={imageSrc}
                                                    alt="User"
                                                    className="image_control_discussion"
                                                    style={{
                                                        objectFit: 'cover',
                                                        cursor: 'pointer',
                                                        width: '30px',
                                                        height: '30px',
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                            </OverlayTrigger>
                                            <span
                                                style={{ fontWeight: '600', fontSize: '12px' }}
                                                className="mutual_class_color name-container"
                                            >
                                                {user.name
                                                    ? user.name
                                                          .split(' ')
                                                          .slice(0, 2)
                                                          .join(' ') +
                                                      (user.name.split(' ').length > 2 ? '...' : '')
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="2" className="text-center">
                                No users selected.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Card>
    );
};

export default ContractUsers;