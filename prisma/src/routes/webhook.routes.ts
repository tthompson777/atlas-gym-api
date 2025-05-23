import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController';

const webhookRoutes = Router();
const controller = new WebhookController();

webhookRoutes.post('/pagamento', controller.receberNotificacao);

export default webhookRoutes;
