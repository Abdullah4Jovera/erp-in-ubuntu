import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Container, Row, Col, Card, Button, Modal, Form, Table, InputGroup } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidebarComponent from "../Components/sidebar/Sidebar";

const AccountantDashboard = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [nonOperationalUsers, setNonOperationalUsers] = useState([]);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [calculatedCommission, setCalculatedCommission] = useState(0);
    const [productsGroupedByUsers, setProductsGroupedByUsers] = useState({});
    const [uniqueProducts, setUniqueProducts] = useState([]);
    const [commissionData, setCommissionData] = useState({});
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const token = useSelector((state) => state.loginSlice.user?.token);

    const commissionRoles = [
        { role: "hod", field: "hod_commission_amount" },
        { role: "hom", field: "hom_commission_amount" },
        { role: "sale_manager", field: "sale_manager_commission_amount" },
        { role: "sales_agent", field: "sales_agent_commission_amount" },
    ];

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const response = await axios.get(`/api/deals/get-deals`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const filteredDeals = response.data.filter(
                    (deal) => deal.deal_stage.name === "Collected"
                );
                setDeals(filteredDeals);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, [token]);

    const handleFetchNonOperationalUsers = async (deal) => {
        try {
            setSelectedDeal(deal);
            const response = await axios.get(`/api/users/get-users-non-operational`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const commissionWithoutVAT = deal?.service_commission_id?.without_vat_commission || 0;
            const calculatedValue = (commissionWithoutVAT * 2.5) / 100;
            setCalculatedCommission(calculatedValue);

            const groupedByProduct = {};
            response.data.forEach((user) => {
                if (user.products && user.products._id) {
                    if (!groupedByProduct[user.products._id]) {
                        groupedByProduct[user.products._id] = [];
                    }
                    groupedByProduct[user.products._id].push(user);
                }
            });

            setProductsGroupedByUsers(groupedByProduct);

            const uniqueProducts = Object.keys(groupedByProduct).map((productId) => ({
                _id: productId,
                name: groupedByProduct[productId][0].products.name,
            }));
            setUniqueProducts(uniqueProducts);

            const initialCommissionData = {};
            uniqueProducts.forEach((product) => {
                const usersForProduct = groupedByProduct[product._id];
                const productCommission = calculatedValue / uniqueProducts.length;
                usersForProduct.forEach((user) => {
                    initialCommissionData[user._id] = {
                        percentage: (100 / usersForProduct.length).toFixed(2),
                        commission: (productCommission / usersForProduct.length).toFixed(2),
                    };
                });
            });

            setCommissionData(initialCommissionData);

            setShowModal(true);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch non-operational users.");
        }
    };

    const handlePercentageChange = (userId, productId, newPercentage) => {
        const usersForProduct = productsGroupedByUsers[productId];
        const totalProductCommission = calculatedCommission / uniqueProducts.length;

        const remainingPercentage = 100 - newPercentage;
        const remainingUsers = usersForProduct.filter((user) => user._id !== userId);

        const updatedCommissionData = { ...commissionData };

        updatedCommissionData[userId].percentage = newPercentage;
        updatedCommissionData[userId].commission = ((newPercentage / 100) * totalProductCommission).toFixed(2);

        const equalPercentageForOthers = remainingPercentage / remainingUsers.length;

        remainingUsers.forEach((user) => {
            updatedCommissionData[user._id].percentage = equalPercentageForOthers.toFixed(2);
            updatedCommissionData[user._id].commission = (
                (equalPercentageForOthers / 100) *
                totalProductCommission
            ).toFixed(2);
        });

        setCommissionData(updatedCommissionData);
    };

    const handleSubmitCommissions = async () => {
        try {
            const commissionDataWithRoles = commissionRoles.map((role) => ({
                role: role.role,
                userId: selectedDeal.service_commission_id[role.role] || null,
                commission: selectedDeal.service_commission_id[role.field] || 0,
            }));

            const commissionPayload = Object.entries(commissionData).map(([userId, data]) => ({
                userId,
                commission: data.commission,
            }));

            await axios.post(
                `/api/commission/store-commissions`,
                {
                    dealId: selectedDeal._id,
                    commissionData: [...commissionDataWithRoles, ...commissionPayload],
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Commission saved successfully!");
            setShowModal(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save commission.");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    // Filtered deals based on search query
    const filteredDeals = deals.filter((deal) =>
        deal.client_id?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    return (
        <div>
            <ToastContainer position="bottom-right" autoClose={3000} />
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        {/* <SidebarComponent /> */}
                    </Col>
                    <Col xs={12} md={12} lg={10}>
                        <Card className="leads_main_cards mt-4">
                            <h2 style={{ color: "white", textAlign: 'center' }}>Accounts Dashboard</h2>
                            <div className="mb-3" style={{ width: '100%', maxWidth: '500px' }} >
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by Client Name"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className='input_field_input_field'
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={handleClearSearch}
                                        style={{
                                            backgroundColor: "#d7aa47",
                                            color: "white",
                                            border: "none",
                                        }}
                                    >
                                        Clear
                                    </Button>
                                </InputGroup>
                            </div>
                            <div style={{ height: '100%', maxHeight: '700px', overflowY: 'auto' }}>
                                {filteredDeals.length > 0 ? (
                                    <Table striped bordered hover variant="dark" responsive>
                                        <thead>
                                            <tr>
                                                <th style={{ backgroundColor: '#d7aa47' }} className="equal-width" >Name</th>
                                                <th style={{ backgroundColor: '#d7aa47' }} className="equal-width" >Email</th>
                                                <th style={{ backgroundColor: '#d7aa47' }} className="equal-width" >Product</th>
                                                <th style={{ backgroundColor: '#d7aa47' }} className="equal-width" >Pipeline</th>
                                                <th style={{ backgroundColor: '#d7aa47' }} className="equal-width" >Lead Type</th>
                                                <th style={{ backgroundColor: '#d7aa47' }} className="equal-width" >Source</th>
                                                <th style={{ backgroundColor: '#d7aa47' }} className="equal-width" >Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredDeals.map((deal) => (
                                                <tr key={deal._id}>
                                                    <td className="table_td_class" >
                                                        <div className="name-container">
                                                            {deal.client_id?.name.split(' ').slice(0, 2).join(' ')}{deal.client_id?.name.split(' ').length > 15 && '...'}
                                                            <span className="tooltip">{deal.client_id?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="table_td_class" >{deal.client_id?.email || "N/A"}</td>
                                                    <td className="table_td_class" >{deal.products?.name || "N/A"}</td>
                                                    <td className="table_td_class" >{deal.pipeline_id?.name || "N/A"}</td>
                                                    <td className="table_td_class" >{deal.lead_type?.name || "N/A"}</td>
                                                    <td className="table_td_class" >{deal.source_id?.name || "N/A"}</td>
                                                    <td className="table_td_class" style={{ textAlign: 'center' }} >
                                                        <Button
                                                            style={{ backgroundColor: '#d7aa47', border: 'none' }}
                                                            onClick={() => handleFetchNonOperationalUsers(deal)}
                                                        >
                                                            Generate Report
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <p className="mutual_class_color text-center" >No Deals Match the Search Criteria.</p>
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Body>
                    {uniqueProducts.map((product) => {
                        const usersForProduct = productsGroupedByUsers[product._id];
                        const totalProductCommission = Math.round(calculatedCommission / uniqueProducts.length);

                        return (
                            <div key={product._id}>
                                <h5 style={{ color: '#d7aa47' }}>{product.name}</h5>
                                <p style={{ color: "white" }}>Total Product Commission: {Math.round(totalProductCommission)} AED</p>
                                {usersForProduct.map((user) => (
                                    <Form.Group key={user._id} className="mb-3">
                                        <Form.Label style={{ color: "white" }}>
                                            {user.name} - ({Math.round(commissionData[user._id]?.commission || "")} AED)
                                            {/* {Math.round(commissionData[user._id]?.percentage || "")}%  */}
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={Math.round(commissionData[user._id]?.percentage || "")}
                                            onChange={(e) =>
                                                handlePercentageChange(user._id, product._id, parseFloat(e.target.value))
                                            }
                                            className="input_field_input_field"
                                        />
                                    </Form.Group>
                                ))}
                            </div>
                        );
                    })}
                </Modal.Body>
                <Modal.Footer style={{ border: "none" }}>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSubmitCommissions} style={{ backgroundColor: "#d7aa47", border: "none" }}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AccountantDashboard;
