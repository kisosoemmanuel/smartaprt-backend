import express from 'express';
import bodyParser from 'body-parser';

import { signup, login, refreshToken, logout } from './controllers/authController.js';
import { authMiddleware, roleMiddleware } from './middleware/auth.js';
import * as userCtrl from './controllers/userController.js';
import * as notifCtrl from './controllers/notificationsController.js';
import * as msgCtrl from './controllers/messageController.js';
import * as eventCtrl from './controllers/eventController.js';
import * as contactCtrl from './controllers/contactController.js';
import * as sugCtrl from './controllers/suggestionController.js';
import * as analyticsCtrl from './controllers/analyticsController.js';
import * as aptCtrl from './controllers/apartmentsConroller.js';
import * as payCtrl from './controllers/paymentConroller.js';
import * as maintCtrl from './controllers/maintenanceController.js';
import * as updateCtrl from './controllers/updatesController.js';
import * as documentController from './controllers/documentController.js';

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// auth
app.post('/signup', signup);
app.post('/login', login);
app.post('/refresh', refreshToken);
app.post('/logout', logout);

// profile
app.get('/me', authMiddleware, userCtrl.getProfile);
app.put('/me', authMiddleware, userCtrl.updateProfile);

// notifications
app.post('/notifications', authMiddleware, roleMiddleware(['LANDLORD','CARETAKER']), notifCtrl.createNotification);
app.get('/notifications', authMiddleware, notifCtrl.listNotifications);
app.put('/notifications/:id/seen', authMiddleware, notifCtrl.markSeen);

// messaging
app.post('/messages', authMiddleware, msgCtrl.sendMessage);
app.get('/messages', authMiddleware, msgCtrl.listMessages);
app.get('/messages/:otherUserId', authMiddleware, msgCtrl.conversation);

// events
app.post('/events', authMiddleware, roleMiddleware(['LANDLORD','CARETAKER']), eventCtrl.createEvent);
app.get('/events', authMiddleware, eventCtrl.listEvents);

// emergency contacts
app.post('/contacts', authMiddleware, roleMiddleware(['LANDLORD','CARETAKER']), contactCtrl.createContact);
app.get('/contacts', authMiddleware, contactCtrl.listContacts);

// suggestions
app.post('/suggestions', authMiddleware, sugCtrl.createSuggestion);
app.get('/suggestions', authMiddleware, roleMiddleware(['LANDLORD','CARETAKER']), sugCtrl.listSuggestions);

// documents
app.post('/documents', authMiddleware, documentController.uploadDocument);
app.get('/documents', authMiddleware, documentController.listDocuments);

// analytics
app.get('/analytics/occupancy', authMiddleware, roleMiddleware(['LANDLORD','CARETAKER']), analyticsCtrl.occupancyRate);
app.get('/analytics/overdue', authMiddleware, roleMiddleware(['LANDLORD','CARETAKER']), analyticsCtrl.overdueRentCount);

// existing routes
app.post('/apartments', authMiddleware, roleMiddleware(['LANDLORD','CARETAKER']), aptCtrl.createApartment);
app.get('/apartments', authMiddleware, aptCtrl.listApartments);
app.post('/units', authMiddleware, roleMiddleware(['LANDLORD','CARETAKER']), aptCtrl.createUnit);
app.put('/units/:unitId/assign', authMiddleware, roleMiddleware(['LANDLORD','CARETAKER']), aptCtrl.assignTenant);

app.post('/invoices', authMiddleware, roleMiddleware(['LANDLORD','CARETAKER']), payCtrl.createInvoice);
app.get('/invoices', authMiddleware, payCtrl.listInvoices);
app.post('/payments', authMiddleware, payCtrl.createPaymentRecord);

app.post('/tickets', authMiddleware, maintCtrl.createTicket);
app.get('/tickets', authMiddleware, maintCtrl.listTickets);
app.put('/tickets/:id', authMiddleware, roleMiddleware(['LANDLORD','CARETAKER','ADMIN']), maintCtrl.updateTicket);

app.post('/updates', authMiddleware, roleMiddleware(['LANDLORD','CARETAKER']), updateCtrl.createUpdate);
app.get('/updates', authMiddleware, updateCtrl.listUpdates);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`server listening on ${PORT}`));
