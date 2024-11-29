import React, { useState } from 'react';
import { Card, Button, Form, Image, Modal, Table } from 'react-bootstrap';
import { FaCloudUploadAlt } from "react-icons/fa";
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../Pages/style.css';
import default_image from '../Assets/default_image.jpg';
import { BiSolidFilePdf } from "react-icons/bi";
import { RiDeleteBinLine } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";
import { TiDeleteOutline } from "react-icons/ti";

const FileUploader = ({ id, singleLead, fetchSingleLead, rtl }) => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const permissions = useSelector(state => state.loginSlice.user?.permissions)
    const [discussionText, setDiscussionText] = useState('');
    const [error, setError] = useState('');
    const [imageErr, setImageErr] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showImageUploader, setShowImageUploader] = useState(false)
    const [deleteFileID, setDeleteFileID] = useState('')
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedFileType, setSelectedFileType] = useState('');
    const [selectedFileUrl, setSelectedFileUrl] = useState('');
    const [fileModal, setFileModal] = useState(false)
    const { files = [] } = singleLead;
    const canAddUserLead = permissions?.includes('add_user_lead');
    const canAddFileLead = permissions?.includes('file_upload');
    const canRemoveFileLead = permissions?.includes('file_delete');


    const handleFileClick = (fileName, fileType) => {
        const fileUrl = `${process.env.REACT_APP_BASE_URL}${fileName.file_path}`;
        setSelectedFileUrl(fileUrl);
        setSelectedFileType(fileType);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedFileUrl('');
        setSelectedFileType('');
    };

    const handleRemoveImage = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setImageErr('Please select files to upload.');
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('files', file);
        });

        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/leads/upload-files/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSelectedFiles([]);
            setImageErr('');
            fetchSingleLead();
            setShowImageUploader(false); // Close modal on successful upload
        } catch (error) {
            console.error('Upload error:', error);
            setImageErr('An error occurred during the upload. Please try again.');
        }
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
        setImageErr(''); // Clear any previous error message
    };

    const OpenDeleteModal = (id) => {
        setDeleteFileID(id)
        setDeleteModal(true)
    }

    const handleDelete = async () => {
        try {
            await axios.delete(
                `${process.env.REACT_APP_BASE_URL}/api/leads/delete-file/${singleLead?._id}/${deleteFileID}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setDeleteModal(false)
            fetchSingleLead();
        } catch (error) {
            console.log(error, 'error');
        }
    };

    return (
        <>
            <Card className="shadow card_discussion mt-2 mb-3 mutual_background_class" style={{ padding: '20px', borderRadius: '10px' }}>
                <div className='discussion_files'>
                    <h5 className='mutual_class_color'>
                        {rtl === 'true' ? 'الملفات' : 'Files'}
                    </h5>
                    {
                        singleLead.is_reject && canAddFileLead
                            ? null
                            : (
                                canAddFileLead && (
                                    <div className='lead_users_delete_btn mb-3'>
                                        <IoMdAdd style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => setShowImageUploader(true)} />
                                    </div>
                                )
                            )
                    }
                </div>
                {imageErr && <div style={{ color: 'red', marginTop: '5px' }}>{imageErr}</div>}
                <Table bordered responsive striped hover className="lead_user_class">
                    <tbody>
                        {files.map((file, index) => {
                            const fileType = file.file_name.endsWith('.pdf')
                                ? 'pdf'
                                : file.file_name.match(/\.(jpeg|jpg|png|gif)$/)
                                    ? 'image'
                                    : '';

                            return (
                                <tr key={index} style={{ height: '40px' }}>
                                    <td onClick={() => handleFileClick(file, fileType)} style={{ verticalAlign: 'middle', backgroundColor: '#2d3134' }}>
                                        {fileType === 'image' ? (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <Image
                                                    src={`${process.env.REACT_APP_BASE_URL}${file.file_path}`}
                                                    alt={file.file_name}
                                                    className="image_control_discussion"
                                                    style={{ objectFit: 'cover', cursor: 'pointer' }}
                                                />
                                                <span className='mutual_class_color' style={{ fontWeight: '600', fontSize: '14px' }}>  {file.file_name.slice(0, 20)}</span>
                                            </div>
                                        ) : fileType === 'pdf' ? (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <BiSolidFilePdf size={30} style={{ color: '#ef222b', cursor: 'pointer' }} />
                                                <span className='mutual_class_color' style={{ fontWeight: '600', fontSize: '14px' }}>  {file.file_name.slice(0, 20)}</span>
                                            </div>
                                        ) : (
                                           <p className='mutual_class_color' > {rtl === 'true' ? 'نوع ملف غير معروف' : 'Unknown File Type'} </p> 
                                        )}
                                    </td>

                                    {
                                        singleLead.is_reject && canRemoveFileLead
                                            ? null
                                            : (
                                                canRemoveFileLead && (
                                                    <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: '#2d3134' }}>
                                                        <div className="lead_users_delete_btn">
                                                            <RiDeleteBinLine onClick={() => OpenDeleteModal(file._id)} style={{ color: 'white', fontSize: '14px', cursor: 'pointer' }} />
                                                        </div>
                                                    </td>
                                                )
                                            )
                                    }
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Card>


            {/* Modal for Image or PDF */}
            <Modal show={showModal} onHide={handleCloseModal} centered size="xl">
                <Modal.Header closeButton style={{ border: 'none' }}>
                    <Modal.Title className='mutual_heading_class'>
                        {rtl === 'true' ? 'معاينة الملف' : 'File Preview'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedFileType === 'image' ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                src={`${selectedFileUrl && selectedFileUrl}`}
                                alt={rtl === 'true' ? 'الملف المحدد' : 'Selected File'}
                                style={{ width: '100%', maxWidth: '800px', height: 'auto', maxHeight: '600px' }}
                            />
                        </div>
                    ) : selectedFileType === 'pdf' ? (
                        <iframe
                            src={`${selectedFileUrl && selectedFileUrl}`}
                            title={rtl === 'true' ? 'معاينة PDF' : 'PDF Preview'}
                            width="100%"
                            height="500px"
                            style={{ border: 'none' }}
                        />
                    ) : (
                        <p className='mutual_class_color' >{rtl === 'true' ? 'لا توجد معاينة متاحة' : 'No preview available'}</p>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ border: 'none' }}>
                    <Button className='all_close_btn_container' onClick={handleCloseModal}>
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>
                    {selectedFileType === 'image' && (
                        <Button className='all_common_btn_single_lead' onClick={() => window.open(selectedFileUrl, '_blank')}>
                            {rtl === 'true' ? 'افتح في علامة تبويب جديدة' : 'Open in New Tab'}
                        </Button>
                    )}
                </Modal.Footer>

            </Modal>

            <Modal
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={showImageUploader}
                onHide={() => setShowImageUploader(false)}
            >
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label className='mutual_heading_class'>
                                {rtl === 'true' ? 'اختر الصور أو ملفات PDF' : 'Choose images or PDFs'}
                            </Form.Label>
                            <div
                                className="image-upload"
                                style={{
                                    border: '2px dashed #d7aa47',
                                    borderRadius: '12px',
                                    padding: '10px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.3s, box-shadow 0.3s',
                                    backgroundColor: '#fef9e7',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = '#a67b21';
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = '#d7aa47';
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                    id="file-upload"
                                    multiple
                                />
                                <label
                                    htmlFor="file-upload"
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <FaCloudUploadAlt size={50} color="#d7aa47" style={{ marginBottom: '8px' }} />
                                    <p
                                        style={{
                                            fontSize: '14px',
                                            color: '#5e5e5e',
                                            margin: 0,
                                            fontWeight: '500',
                                        }}
                                    >
                                        {rtl === 'true'
                                            ? 'قم بالسحب والإفلات أو انقر للتحميل'
                                            : 'Drag and drop or click to upload'}
                                    </p>
                                </label>
                            </div>
                            {imageErr && <p style={{ color: 'red', marginTop: '10px' }}>{imageErr}</p>}
                        </Form.Group>
                    </Form>
                    {/* Selected Files */}
                    {selectedFiles.length > 0 && (
                        <div className="mt-4">
                            <h6 className='mutual_heading_class'>
                                {rtl === 'true' ? 'المعاينة:' : 'Preview:'}
                            </h6>
                            <div className="d-flex flex-wrap">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="position-relative me-2 mb-2">
                                        {file.type === 'application/pdf' ? (
                                            <div
                                                onClick={() => handleFileClick(file, 'pdf')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <BiSolidFilePdf
                                                    size={30}
                                                    className="pdf_icon_fallback"
                                                    style={{ color: '#ef222b' }}
                                                />
                                                <Image
                                                    src={default_image}
                                                    alt={rtl === 'true' ? 'معاينة PDF' : 'PDF Preview'}
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        objectFit: 'cover',
                                                        borderRadius: '10px',
                                                        border: '1px solid #d7aa47',
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => handleFileClick(file, 'image')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <Image
                                                    src={URL.createObjectURL(file)}
                                                    alt={rtl === 'true' ? 'المعاينة' : 'Preview'}
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        objectFit: 'cover',
                                                        borderRadius: '10px',
                                                        border: '1px solid #d7aa47',
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRemoveImage(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '0',
                                                left: '0',
                                                borderRadius: '50%',
                                                padding: '0.2rem 0.5rem',
                                            }}
                                        >
                                            &times;
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ border: 'none' }}>
                    <Button
                        className='all_common_btn_single_lead'
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0}
                    >
                        {rtl === 'true' ? 'تحميل' : 'Upload'}
                    </Button>
                    <Button
                        className='all_close_btn_container'
                        onClick={() => setShowImageUploader(false)}
                    >
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete File Modal */}
            <Modal
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={deleteModal}
                onHide={() => setDeleteModal(false)}
            >
                <Modal.Header closeButton style={{ border: 'none' }}>
                    <Modal.Title
                        id="contained-modal-title-vcenter"
                        className="mutual_heading_class"
                    >
                        {rtl === 'true' ? 'حذف المستخدم' : 'Delete User'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <TiDeleteOutline className="text-danger" style={{ fontSize: '4rem' }} />
                    <p className="mutual_heading_class">
                        {rtl === 'true' ? 'هل أنت متأكد أنك تريد حذف هذا الملف؟' : 'Are you sure you want to delete this File?'}
                    </p>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none' }}>
                    <Button onClick={() => setDeleteModal(false)} className="all_close_btn_container">
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>
                    <Button className="all_common_btn_single_lead" onClick={handleDelete}>
                        {rtl === 'true' ? 'حذف' : 'Delete'}
                    </Button>
                </Modal.Footer>

            </Modal>
        </>
    );
};

export default FileUploader;
