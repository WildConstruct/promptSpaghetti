import * as Comlink from 'comlink';
import { PreviewService } from '../PreviewService';

const api = {
  simulate: PreviewService.simulate,
  branchMap: PreviewService.branchMap
};

Comlink.expose(api);
