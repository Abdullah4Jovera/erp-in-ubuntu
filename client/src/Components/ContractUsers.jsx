import React from 'react';
import { Table } from 'react-bootstrap';
import { RiDeleteBinLine } from "react-icons/ri";

const ContractUsers = ({ contract }) => {
    const { selected_users } = contract;

    return (
        <div>
            <Table striped bordered hover responsive>
                <tbody>
                    {selected_users && selected_users.length > 0 ? (
                        selected_users.map((user, index) => (
                            <tr key={user._id}>
                                <td>{index + 1}</td>
                                <td style={{ verticalAlign: 'middle', backgroundColor: '#2d3134' }}>{user.name}</td>
                                <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <div className="lead_users_delete_btn">
                                        <RiDeleteBinLine
                                            style={{ color: 'white', fontSize: '14px', cursor: 'pointer' }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2" className="text-center">
                                No users selected.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default ContractUsers;
