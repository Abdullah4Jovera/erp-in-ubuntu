import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Image, Table, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useSelector } from "react-redux";
import UserDashboardStatus from './UserDashboardStatus';
const HodDashboardDetails = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const location = useLocation();
    const { dashboardData, financeStatus } = location.state || {}; // Retrieve state
    return (
        <div>
            <UserDashboardStatus/>
        </div>
    );
};

export default HodDashboardDetails;
