import React, { useEffect, useState } from 'react';
import { Card, Col, Container, Row, Spinner, Button, Modal, Form, Table } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { AiFillDelete } from "react-icons/ai";
import { BiMessageSquareEdit } from "react-icons/bi";
import { BiSolidMessageAltAdd } from "react-icons/bi";
import { TiDeleteOutline } from "react-icons/ti";

const LabelManagement = () => {
    const UserPipeline = useSelector(state => state.loginSlice.user?.pipeline || []);
    const pipelines = useSelector(state => state.loginSlice.pipelines || []);
    const token = useSelector(state => state.loginSlice.user?.token);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPipeline, setSelectedPipeline] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false); // For create label modal
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [newLabelName, setNewLabelName] = useState('');
    const [newLabelColor, setNewLabelColor] = useState('');
    const [newLabelPipeline, setNewLabelPipeline] = useState('');
    const [delLabelModal, setDelLabelModal] = useState(false);
    const [deleteLabelId, setDeleteLabelId] = useState(null)
    const [rtl, setRtl] = useState(null);

    const fetchLabels = async () => {
        setLoading(true);
        setError(null);

        try {
            const requests = selectedPipeline
                ? [axios.get(`/api/labels/pipeline/${selectedPipeline}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })]
                : UserPipeline.length
                    ? UserPipeline.map(pipeline =>
                        axios.get(`/api/labels/pipeline/${pipeline}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                    )
                    : [axios.get(`/api/labels/all`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })];

            const responses = await Promise.all(requests);
            const fetchedLabels = responses.flatMap(response => response.data);
            setLabels(fetchedLabels);
        } catch (err) {
            setError('Failed to fetch labels');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedRtl = localStorage.getItem('rtl');
        setRtl(savedRtl); // Update state with the 'rtl' value from localStorage
    }, [rtl]);


    useEffect(() => {
        if (token) {
            fetchLabels();
        }
    }, [UserPipeline, token, selectedPipeline]);

    const handlePipelineClick = (pipelineId) => {
        setSelectedPipeline(pipelineId);
        setNewLabelPipeline(pipelineId); // Set the selected pipeline in the create label modal automatically
    };

    const handleClearFilter = () => {
        setSelectedPipeline('');
        setNewLabelPipeline(''); // Clear the selected pipeline when clearing the filter
    };

    const handleEdit = (label) => {
        setSelectedLabel(label);
        setNewLabelName(label.name);
        setNewLabelColor(label.color);
        setShowEditModal(true);
    };

    const handleDelete = async (labelId) => {
        try {
            await axios.delete(`/api/labels/${labelId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLabels(labels.filter(label => label._id !== labelId));
            setDelLabelModal(false)
        } catch (err) {
            setError('Failed to delete label');
        }
    };

    const handleUpdateLabel = async () => {
        try {
            const updatedLabel = {
                name: newLabelName,
                color: newLabelColor,
            };
            const response = await axios.put(`/api/labels/${selectedLabel._id}`, updatedLabel, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchLabels();
            setLabels(labels.map(label => (label._id === selectedLabel._id ? response.data : label)));
            setShowEditModal(false);
            setNewLabelColor('')
            setNewLabelName('')
            setNewLabelPipeline('')
        } catch (err) {
            setError('Failed to update label');
        }
    };

    const handleCreateLabel = async () => {
        try {
            const newLabel = {
                name: newLabelName,
                color: newLabelColor,
                pipeline_id: newLabelPipeline || UserPipeline, // Only send pipeline if selected
            };
            const response = await axios.post(`/api/labels/create`, newLabel, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchLabels();
            setLabels([...labels, response.data]);
            setShowCreateModal(false); // Close modal after creation
            setNewLabelName('');
            setNewLabelColor('');
            setNewLabelPipeline('');
        } catch (err) {
            setError('Failed to create label');
        }
    };

    // Mapping color to custom background color
    const getBackgroundColor = (color) => {
        let backgroundColor = '';
        switch (color) {
            case 'success':
                backgroundColor = '#6fd943';
                break;
            case 'danger':
                backgroundColor = '#ff3a6e';
                break;
            case 'primary':
                backgroundColor = '#5c91dc';
                break;
            case 'warning':
                backgroundColor = '#ffa21d';
                break;
            case 'info':
                backgroundColor = '#6ac4f4';
                break;
            case 'secondary':
                backgroundColor = '#6c757d';
                break;
            default:
                backgroundColor = '#ccc';
        }
        return backgroundColor;
    };

    const colorOptions = [
        { name: 'Primary', color: 'primary' },
        { name: 'Secondary', color: 'secondary' },
        { name: 'Info', color: 'info' },
        { name: 'Warning', color: 'warning' },
        { name: 'Danger', color: 'danger' },
        { name: 'Dark', color: 'dark' },
        { name: 'Success', color: 'success' },
    ];

    const handleOpenDeleteModal = (id) => {
        setDelLabelModal(true)
        setDeleteLabelId(id)
    }

    return (
        <div>
            <Container fluid style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        {/* <Sidebar /> */}
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <Card className="leads_main_cards"  >
                            <h1
                                className="text-center mutual_heading_class"
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'center', // Align text dynamically
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',    // Set text direction dynamically
                                }}
                            >
                                {rtl === 'true' ? 'إدارة التسميات' : 'Label Management'}
                            </h1>

                            {/* Pipeline Buttons for filtering */}
                            {Array.isArray(UserPipeline) && UserPipeline.length === 0 && (
                                <div className="text-center">
                                    <Button onClick={handleClearFilter} className="mx-2 mt-3 " style={{ backgroundColor: '#6c757da2', border: 'none' }}>
                                        All Pipelines
                                    </Button>
                                    {pipelines.map((pipeline) => (
                                        <Button
                                            key={pipeline._id}
                                            variant="outline-primary"
                                            onClick={() => handlePipelineClick(pipeline._id)}
                                            className="mx-2 mt-3"
                                            style={{
                                                backgroundColor: selectedPipeline === pipeline._id ? '#d7aa47' : '#6c757da2',
                                                color: selectedPipeline === pipeline._id ? 'white' : 'white',
                                                border: "none"
                                            }}
                                        >
                                            {pipeline.name}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Create Label Button */}
                            <div className="text-end">
                                <BiSolidMessageAltAdd onClick={() => setShowCreateModal(true)} style={{ fontSize: '40px', color: '#d7aa47', cursor: 'pointer' }} />
                            </div>

                            {loading ? (
                                <div className="text-center">
                                    <Spinner animation="grow" style={{ color: '#d7aa47' }} />
                                </div>
                            ) : error ? (
                                <div className="text-center text-danger">
                                    {error}
                                </div>
                            ) : (
                                <div style={{ height: '100%', maxHeight: '700px', overflowY: 'auto' }}>
                                    <Table hover striped responsive bordered variant='dark' size='md'>
                                        <thead style={{ backgroundColor: '#d7aa47' }} className='sticky-top' >
                                            <tr className="teble_tr_class" style={{
                                                backgroundColor: '#d7aa47',
                                                color: '#343a40',
                                                border: '1px solid #d7aa47',
                                                transition: 'background-color 0.3s ease',
                                            }}>
                                                <th
                                                    style={{
                                                        backgroundColor: '#d7aa47',
                                                        color: "white",
                                                        textAlign: rtl === 'true' ? 'right' : 'left', // Align text dynamically based on rtl
                                                        direction: rtl === 'true' ? 'rtl' : 'ltr',   // Set text direction dynamically
                                                    }}
                                                >
                                                    {rtl === 'true' ? 'اللون' : 'Color'}
                                                </th>

                                                <th
                                                    className='text-center'
                                                    style={{
                                                        backgroundColor: '#d7aa47',
                                                        color: "white",
                                                        textAlign: rtl === 'true' ? 'right' : 'center', // Align text dynamically
                                                        direction: rtl === 'true' ? 'rtl' : 'ltr',     // Set text direction dynamically
                                                    }}
                                                >
                                                    {rtl === 'true' ? 'الاسم' : 'Name'}
                                                </th>

                                                <th
                                                    className='text-center'
                                                    style={{
                                                        backgroundColor: '#d7aa47',
                                                        color: "white",
                                                        textAlign: rtl === 'true' ? 'right' : 'center', // Align text dynamically
                                                        direction: rtl === 'true' ? 'rtl' : 'ltr',     // Set text direction dynamically
                                                    }}
                                                >
                                                    {rtl === 'true' ? 'الإجراءات' : 'Actions'}
                                                </th>

                                            </tr>
                                        </thead>
                                        <tbody >
                                            {labels.map((label) => (
                                                <tr key={label._id} className='table_td_class'>
                                                    <td className="cell-width table_td_class">
                                                        <div
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                backgroundColor: getBackgroundColor(label.color),
                                                                borderRadius: '4px'
                                                            }}
                                                        ></div>
                                                    </td>
                                                    <td className="cell-width table_td_class">{label.name}</td>
                                                    <td className="cell-width table_td_class" >
                                                        <BiMessageSquareEdit
                                                            onClick={() => handleEdit(label)}
                                                            style={{ fontSize: '20px', color: '#ffa21d', cursor: 'pointer', marginRight: '10px' }}
                                                        />
                                                        <AiFillDelete
                                                            // onClick={() => handleDelete(label._id)}
                                                            onClick={() => handleOpenDeleteModal(label._id)}
                                                            style={{ fontSize: '20px', color: 'red', cursor: 'pointer' }}
                                                        />

                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Edit Label Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header
                    closeButton
                    style={{
                        border: 'none',
                        textAlign: rtl === 'true' ? 'right' : 'left',
                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                    }}
                >
                    <Modal.Title className='mutual_heading_class'>
                        {rtl === 'true' ? 'تعديل التسمية' : 'Edit Label'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ textAlign: rtl === 'true' ? 'right' : 'left', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                    <Form>
                        <Form.Group controlId="labelName">
                            <Form.Label className='mutual_heading_class'>
                                {rtl === 'true' ? 'اسم التسمية' : 'Label Name'}
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={newLabelName}
                                onChange={(e) => setNewLabelName(e.target.value)}
                                className='input_field_input_field'
                            />
                        </Form.Group>

                        <Form.Group controlId="labelColor">
                            <Form.Label className='mutual_heading_class'>
                                {rtl === 'true' ? 'لون التسمية' : 'Label Color'}
                            </Form.Label>
                            <div className="d-flex flex-wrap">
                                {colorOptions.map(option => (
                                    <Button
                                        key={option.color}
                                        variant={option.color}
                                        style={{
                                            width: '30px', height: '30px', margin: '5px', borderRadius: '4px',
                                            backgroundColor: newLabelColor === option.color ? option.color : '',
                                            border: newLabelColor === option.color ? '2px solid #fff' : ''
                                        }}
                                        onClick={() => setNewLabelColor(option.color)}
                                    >
                                        {newLabelColor === option.color && <span style={{ color: '#fff' }}>✔</span>}
                                    </Button>
                                ))}
                            </div>
                        </Form.Group>

                        <Form.Group controlId="labelPipeline">
                            <Form.Label className='mutual_heading_class'>
                                {rtl === 'true' ? 'الأنبوب' : 'Pipeline'}
                            </Form.Label>
                            <Form.Control
                                as="select"
                                value={newLabelPipeline}
                                onChange={(e) => setNewLabelPipeline(e.target.value)}
                                className='input_field_input_field'
                            >
                                <option value="">{rtl === 'true' ? 'اختر الأنبوب' : 'Select Pipeline'}</option>
                                {pipelines.map((pipeline) => (
                                    <option key={pipeline._id} value={pipeline._id}>
                                        {pipeline.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer
                    style={{
                        border: 'none',
                        textAlign: rtl === 'true' ? 'right' : 'left',
                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                    }}
                >
                    <Button
                        className='all_close_btn_container'
                        onClick={() => {
                            // Reset state values
                            setNewLabelName('');
                            setNewLabelColor('');
                            setNewLabelPipeline('');

                            // Close the modal
                            setShowEditModal(false);
                        }}
                    >
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>
                    <Button className='all_common_btn_single_lead' onClick={handleUpdateLabel}>
                        {rtl === 'true' ? 'تحديث' : 'Update'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Create Label Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header
                    closeButton
                    style={{
                        border: 'none',
                        textAlign: rtl === 'true' ? 'right' : 'left',
                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                    }}
                >
                    <Modal.Title className='mutual_heading_class'>
                        {rtl === 'true' ? 'إنشاء التسمية' : 'Create Label'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body
                    style={{
                        textAlign: rtl === 'true' ? 'right' : 'left',
                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                    }}
                >
                    <Form>
                        <Form.Group controlId="newLabelName">
                            <Form.Label className='mutual_heading_class'>
                                {rtl === 'true' ? 'اسم التسمية' : 'Label Name'}
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={newLabelName}
                                onChange={(e) => setNewLabelName(e.target.value)}
                                className='input_field_input_field'
                            />
                        </Form.Group>

                        <Form.Group controlId="newLabelColor">
                            <Form.Label className='mutual_heading_class'>
                                {rtl === 'true' ? 'لون التسمية' : 'Label Color'}
                            </Form.Label>
                            <div className="d-flex flex-wrap">
                                {colorOptions.map(option => (
                                    <Button
                                        key={option.color}
                                        variant={option.color}
                                        style={{
                                            width: '30px', height: '30px', margin: '5px', borderRadius: '4px',
                                            backgroundColor: newLabelColor === option.color ? option.color : '',
                                            border: newLabelColor === option.color ? '2px solid #fff' : ''
                                        }}
                                        onClick={() => setNewLabelColor(option.color)}
                                    >
                                        {newLabelColor === option.color && <span style={{ color: '#fff' }}>✔</span>}
                                    </Button>
                                ))}
                            </div>
                        </Form.Group>

                        <Form.Group controlId="newLabelPipeline">
                            <Form.Label className='mutual_heading_class'>
                                {rtl === 'true' ? 'الأنبوب' : 'Pipeline'}
                            </Form.Label>
                            <Form.Control
                                as="select"
                                value={newLabelPipeline}
                                onChange={(e) => setNewLabelPipeline(e.target.value)}
                                className='input_field_input_field'
                            >
                                <option value="">{rtl === 'true' ? 'اختر الأنبوب' : 'Select Pipeline'}</option>
                                {pipelines.map((pipeline) => (
                                    <option key={pipeline._id} value={pipeline._id}>
                                        {pipeline.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer
                    style={{
                        border: 'none',
                        textAlign: rtl === 'true' ? 'right' : 'left',
                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                    }}
                >
                    <Button
                        className='all_close_btn_container'
                        onClick={() => {
                            setShowCreateModal(false);
                            setNewLabelName('');
                            setNewLabelColor('');
                            setNewLabelPipeline('');
                        }}
                    >
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>
                    <Button className='all_common_btn_single_lead' onClick={handleCreateLabel}>
                        {rtl === 'true' ? 'إنشاء التسمية' : 'Create Label'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Modal Confirm */}
            <Modal
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={delLabelModal}
                onHide={() => setDelLabelModal(false)}
            >
                <Modal.Header closeButton style={{ border: 'none', textAlign: rtl === 'true' ? 'right' : 'left', direction: rtl === 'true' ? 'rtl' : 'ltr' }} >
                    <Modal.Title id="contained-modal-title-vcenter" className='mutual_heading_class'>
                        {rtl === 'true' ? 'حذف التسمية' : 'Delete Label'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center" style={{ textAlign: rtl === 'true' ? 'right' : 'center', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                    <TiDeleteOutline className="text-danger" style={{ fontSize: '6rem' }} />
                    <p className='mutual_heading_class'>
                        {rtl === 'true' ? 'هل أنت متأكد أنك تريد حذف هذه التسمية؟' : 'Are you sure you want to delete this label?'}
                    </p>
                </Modal.Body>

                <Modal.Footer style={{ border: 'none', textAlign: rtl === 'true' ? 'right' : 'left', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                    <Button className='all_close_btn_container' onClick={() => setDelLabelModal(false)}>
                        {rtl === 'true' ? 'لا' : 'No'}
                    </Button>
                    <Button className='all_common_btn_single_lead' onClick={() => handleDelete(deleteLabelId)}>
                        {rtl === 'true' ? 'نعم' : 'Yes'}
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default LabelManagement;
