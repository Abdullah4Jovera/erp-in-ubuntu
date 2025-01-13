import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Table, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './CeoDashboard.css';

const CeoPipelineCommission = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pipelineCommissionStatus, setPipelineCommissionStatus] = useState([]);
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility
    const [selectedPipeline, setSelectedPipeline] = useState(null); // State to store the selected pipeline for modal

    // Function to fetch data from the API
    const fetchPipelineCommission = async () => {
        try {
            const response = await axios.get('/api/commission/all-pipelines-commission', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPipelineCommissionStatus(response.data.pipelines); // Store the pipeline stats in state
            setLoading(false); // Set loading to false after data is fetched
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPipelineCommission();
    }, [token]);

    const handleShowModal = (pipeline) => {
        setSelectedPipeline(pipeline); // Set the selected pipeline to show in the modal
        setShowModal(true); // Show the modal
    };

    const handleCloseModal = () => {
        setShowModal(false); // Hide the modal
        setSelectedPipeline(null); // Reset the selected pipeline
    };

    if (loading) {
        return (
            <Container className="text-center">
                <div className="text-center">
                    <Spinner animation="border" style={{ color: '#d7aa47' }} />
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="text-center">
                <p>{error}</p>
            </Container>
        );
    }

    return (
        <Container>
            <Table striped bordered hover responsive variant="dark" className='mt-2'>
                <thead>
                    <tr>
                        <th style={{ backgroundColor: '#d7aa47' }} >Pipeline Name</th>
                        <th style={{ backgroundColor: '#d7aa47' }}>Total All Time Commission</th>
                        <th style={{ backgroundColor: '#d7aa47' }}>Current Month Commission</th>
                        <th style={{ backgroundColor: '#d7aa47' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pipelineCommissionStatus.map((pipeline) => (
                        <tr key={pipeline._id}>
                            <td>{pipeline.pipelineName}</td>
                            <td>{`${Math.round(pipeline.totalAllTimeCommission)} AED`}</td>
                            <td>{`${Math.round(pipeline.currentMonthCommission)} AED`}</td>
                            <td style={{display:"flex" , justifyContent:'center' }}>
                                <Button className='all_common_btn_single_lead' onClick={() => handleShowModal(pipeline)}>Details</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal to show the detailed commission data */}
            {selectedPipeline && (
                <Modal show={showModal} onHide={handleCloseModal} centered size='md' >
                    <Modal.Header closeButton style={{ border: 'none', color: '#d7aa47' }} >
                        <Modal.Title>Commission of {selectedPipeline.pipelineName}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table striped bordered hover variant="dark">
                            <thead>
                                <tr className='text-center' >
                                    <th style={{ backgroundColor: '#d7aa47' }}>Month</th>
                                    <th style={{ backgroundColor: '#d7aa47' }}>Total Commissions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedPipeline.last12MonthsCommissions.map((monthData, index) => (
                                    <tr key={index} className='text-center'>
                                        <td>{monthData.label}</td>
                                        <td>{`${Math.round(monthData.total)} AED`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer style={{ border: 'none' }}>
                        <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            )}
            <ToastContainer />
        </Container>
    );
};

export default CeoPipelineCommission;
