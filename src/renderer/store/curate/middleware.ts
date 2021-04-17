import { BackIn } from '@shared/back/types';
import { CurationState } from '@shared/curate/types';
import { genCurationWarnings } from '@shared/Util';
import { Middleware } from 'redux';
import { ApplicationState } from '..';
import { CurateActionType } from './enums';
import { CurateState } from './types';

export const curationSyncMiddleware: Middleware<{}, ApplicationState> = (store) => (next) => (action: any) => {
  switch (action.type) {
    case CurateActionType.DELETE: {
      // Lock curation from further edits
      store.dispatch({
        type: CurateActionType.SET_LOCK,
        folders: action.folders,
        locked: true
      });
      window.Shared.back.send(BackIn.CURATE_DELETE, action.folders);
      next(action);
      break;
    }
    case CurateActionType.IMPORT: {
      // Lock curation from further edits
      store.dispatch({
        type: CurateActionType.SET_LOCK,
        folders: action.folders,
        locked: true
      });
      const state = store.getState();
      const folders: string[] = action.folders;
      const curations = folders.map(f => state.curate.curations.find(c => c.folder === f)).filter(c => c !== undefined) as CurationState[];
      // Send curation import request to back
      if (curations.length > 0) {
        window.Shared.back.send(BackIn.IMPORT_CURATION, {
          curations: curations,
          saveCuration: action.saveCuration
        });
      }
      next(action);
      break;
    }
    case CurateActionType.EXPORT: {
      store.dispatch({
        type: CurateActionType.SET_LOCK,
        folders: action.folders,
        locked: true
      });
      const state = store.getState();
      const folders: string[] = action.folders;
      const curations = folders.map(f => state.curate.curations.find(c => c.folder === f)).filter(c => c !== undefined) as CurationState[];
      // Send curation import request to back
      if (curations.length > 0) {
        window.Shared.back.send(BackIn.CURATE_EXPORT, curations);
      }
      next(action);
      break;
    }
    case CurateActionType.CREATE_CURATION: {
      // Set new curation as current
      store.dispatch({
        type: CurateActionType.SET_CURRENT_CURATION,
        folder: action.folder
      });
    }
    // eslint-disable-next-line no-fallthrough
    case CurateActionType.EDIT_ADDAPP:
    case CurateActionType.NEW_ADDAPP:
    case CurateActionType.REMOVE_ADDAPP:
    case CurateActionType.EDIT_CURATION_META:
    case CurateActionType.ADD_TAG:
    case CurateActionType.REMOVE_TAG: {
      next(action);
      const state = store.getState();
      const curationsState = state.curate;
      const modifiedCuration = curationsState.curations.find(c => c.folder === action.folder);
      if (modifiedCuration) {
        // Generate new warnings
        store.dispatch({
          type: CurateActionType.SET_WARNINGS,
          folder: modifiedCuration.folder,
          warnings: genCurationWarnings(modifiedCuration, window.Shared.config.fullFlashpointPath, state.main.suggestions, state.main.lang.curate)
        });
        log.debug('Curate', `Sync Requirable Action Performed: ${action.type}`);
      } else {
        log.error('Curate', `Action performed but no curation found to generate warnings for? ${JSON.stringify(action)}`);
      }
      break;
    }
    case CurateActionType.SET_WARNINGS: {
      next(action);
      const state: CurateState = store.getState().curate;
      const modifiedCuration = state.curations.find(c => c.folder === action.folder);
      if (modifiedCuration) {
        // @TODO Queue system, delays, etc to lower number of calls?
        // Send update to backend
        window.Shared.back.request(BackIn.CURATE_SYNC_CURATIONS, [modifiedCuration]);
      } else {
        log.error('Curate', `Action performed but no curation found to save warnings for? ${JSON.stringify(action)}`);
      }
      break;
    }
    default:
      next(action);
      break;
  }
};
