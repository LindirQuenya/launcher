import { CurateBox } from '@renderer/components/CurateBox';
import { WithCurateStateProps } from '@renderer/containers/withCurateState';
import { WithMainStateProps } from '@renderer/containers/withMainState';
import { WithPreferencesProps } from '@renderer/containers/withPreferences';
import { WithTagCategoriesProps } from '@renderer/containers/withTagCategories';
import { useMouse } from '@renderer/hooks/useMouse';
import { CurateActionType } from '@renderer/store/curate/enums';
import { findElementAncestor, getPlatformIconURL } from '@renderer/Util';
import { uuid } from '@renderer/util/uuid';
import { BackIn } from '@shared/back/types';
import { LoadedCuration } from '@shared/curate/types';
import * as electron from 'electron';
import * as React from 'react';

const index_attr = 'data-index';

type OwnProps = {

}

export type CuratePageProps = OwnProps & WithPreferencesProps & WithTagCategoriesProps & WithMainStateProps & WithCurateStateProps

export function CuratePage(props: CuratePageProps) {
  const curation: LoadedCuration | undefined = props.curate.curations[props.curate.current];

  const [onListMouseDown, onListMouseUp] = useMouse<number>(() => ({
    chain_delay: 500,
    find_id: (event) => {
      let index: number | undefined;
      try { index = findAncestorRowIndex(event.target as Element); }
      catch (error) { console.error(error); }
      return index;
    },
    on_click: (event, id, clicks) => {
      if (event.button === 0 && clicks === 1) { // Single left click
        props.dispatchCurate({
          type: CurateActionType.SET_CURRENT_CURATION,
          index: id,
        });
      }
    },
  }));

  const onNewCuration = React.useCallback(() => {
    props.dispatchCurate({
      type: CurateActionType.CREATE_CURATION,
      folder: uuid(),
    });
  }, []);

  const onLoadCuration = React.useCallback(() => {
    electron.remote.dialog.showOpenDialog({
      title: 'Select curation archive(s) to load',
    })
    .then(value => window.Shared.back.send(BackIn.CURATE_LOAD_ARCHIVES, value.filePaths));
  }, []);

  return (
    <div className='curate-page'>
      <div
        className='curate-page__left simple-scroll'
        onMouseDown={onListMouseDown}
        onMouseUp={onListMouseUp}>
        {props.curate.curations.map((curation, index) => (
          <div
            className={
              'curate-list-item'+
              ((index === props.curate.current) ? ' curate-list-item--selected' : '')
            }
            key={curation.folder}
            { ...{ [index_attr]: index } }>
            <div
              className='curate-list-item__icon'
              style={{ backgroundImage: `url('${getPlatformIconURL('Flash'/* curation.meta.platform*/, props.main.logoVersion)}')` }} />
            <p className='curate-list-item__title'>
              {curation.folder}
            </p>
          </div>
        ))}
      </div>
      <div className='curate-page__center simple-scroll'>
        { curation ? (
          <CurateBox
            curation={curation}
            suggestions={props.main.suggestions}
            dispatch={props.dispatchCurate} />
        ) : (
          <div>
            No curation selected.
          </div>
        )}
      </div>
      <div className='curate-page__right simple-scroll'>
        <button onClick={onNewCuration}>New Curation</button><br/>
        <button onClick={onLoadCuration}>Load curation(s)</button>
      </div>
    </div>
  );
}

function findAncestorRowIndex(element: Element): number | undefined {
  const ancestor = findElementAncestor(element, target => target.getAttribute(index_attr) !== null, true);
  if (!ancestor) { return undefined; }

  const index = ancestor.getAttribute(index_attr);
  if (typeof index !== 'string') { throw new Error('Failed to get attribute from ancestor!'); }

  const index_number = (index as any) * 1; // Coerce to number
  if (isNaN(index_number)) { throw new Error('Failed to convert attribute to a number!'); }

  return index_number;
}
