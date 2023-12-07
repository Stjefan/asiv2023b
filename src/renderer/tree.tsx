import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Tree,
  TreeExpandedKeysType,
  TreeNodeTemplateOptions,
} from 'primereact/tree';
import { ContextMenu } from 'primereact/contextmenu';
import { Toast } from 'primereact/toast';
import { RxDocument } from 'rxdb';
import { TreeNode } from 'primereact/treenode';
import { RadioButton } from 'primereact/radiobutton';
import { Toolbar } from 'primereact/toolbar';
import { groupByMultipleKeys, object2array } from './utility';
import { ASIVContext } from './App';

function baseHandlingDocs(
  docs: RxDocument<any>[],
  nodesMap: Map<string, TreeNode>,
) {
  const nodes = docs
    .map((i) => i.toJSON())
    .map((i) => ({
      ...i,
      data: i,
      children: [],
      label: i.arbeitsplatznummer ?? i.name,
      item: i,
      id: i.id,
      type: 'arbeitsplatz',
      archiviert: i.archiviert,
    }));

  for (const n of nodes) {
    nodesMap.set(n.id, n);
  }

  const groupsNested = groupByMultipleKeys(nodes, [
    'werknummer',
    'gebaeude',
    'etage',
    'abteilung',
    'kostenstelle',
  ]);
  const array = object2array(groupsNested, null, 0);

  // const array = Object.keys(groupsNested).reduce((arr, key) => {
  //   arr.push({ label: key, children: groupsNested[key] });
  //   return arr;
  // }, [] as any[]);

  // this.nodes = array;
  return array;
}

export function Empty() {}

interface Mode {
  key: string;
  name: string;
}
export function TreeView() {
  const [nodes, setNodes] = useState([]);
  const context = useContext(ASIVContext);
  const { db, setEdit, setDialogEdit, getDocById } = context;
  const modes: Mode[] = [
    { name: 'Aktuelle', key: 'current' },
    { name: 'Archivierte', key: 'archived' },
    { name: 'Alle', key: 'all' },
  ];
  const [excludeArchive, setExcludeArchive] = useState(modes[0]);

  function loadData(excludeArchiv: Mode) {
    console.log('loadData is triggered', db);

    const currentSelector =
      excludeArchiv.key == 'all'
        ? null
        : { archiviert: excludeArchive?.key == 'archived' ? 1 : 0 };
    const nodes = db.arbeitsplatzmessungen
      .find({
        selector: {
          ...currentSelector,
        },
      })
      .$.subscribe((docs) => {
        // console.log(docs)
        setNodes(baseHandlingDocs(docs as any[], nodesMap));
      });
    return nodes;
  }
  useEffect(() => {
    if (db) {
      const subscription = loadData(excludeArchive);
      return () => subscription.unsubscribe();
    }
    console.log('Empty effect');
    return () => 0;
  }, [db, excludeArchive]);

  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<TreeExpandedKeysType>({});
  const toast = useRef<Toast>(null);
  const cm = useRef<ContextMenu>(null);
  const nodesMap = new Map<string, TreeNode>();
  const menu = [
    {
      label: 'Bearbeiten',
      icon: 'pi pi-search',
      command: async () => {
        setEdit(await getDocById(selectedNodeKey));
        setDialogEdit(true);
        // toast.current.show({ severity: 'success', summary: 'Node Key', detail: selectedNodeKey });
      },
    },
    // {
    //     label: 'Toggle',
    //     icon: 'pi pi-sort',
    //     command: () => {
    //         const _expandedKeys = { ...expandedKeys };
    //         if (_expandedKeys[selectedNodeKey]) delete _expandedKeys[selectedNodeKey];
    //         else _expandedKeys[selectedNodeKey] = true;
    //         setExpandedKeys(_expandedKeys);
    //     }
    // }
  ];

  const nodeTemplate = (node: TreeNode, options: TreeNodeTemplateOptions) => {
    let label = <b>{node.label}</b>;
    if (node.data?.archiviert == 1) {
      label = (
        <b className="text-danger" style={{ backgroundColor: 'red' }}>
          {' '}
          {node.label}
        </b>
      );
    }

    return <span className={options.className}>{label}</span>;
  };

  const toolbarStart = () => (
    <div className=''>
      {modes.map((category) => {
        return (
          <div key={category.key} className="">
            <RadioButton
              inputId={category.key}
              name="category"
              value={category}
              onChange={(e) => setExcludeArchive(e.value)}
              checked={excludeArchive.key === category.key}
            />
            <label htmlFor={category.key} className="ml-2">
              {category.name}
            </label>
          </div>
        );
      })}
      </div>
  );

  return (
    <div className="card flex justify-content-center">
      <ContextMenu model={menu} ref={cm} />
      <Toast ref={toast} />
      <div >
      <Toolbar start={toolbarStart} className='flex justify-content-center flex-wrap' />
      <Tree
        value={nodes}
        className="w-full md:w-30rem"
        expandedKeys={expandedKeys}
        onToggle={(e) => setExpandedKeys(e.value)}
        contextMenuSelectionKey={selectedNodeKey}
        onContextMenuSelectionChange={(e) => setSelectedNodeKey(e.value as any)}
        onContextMenu={(e) => {
          if (e.node.type == 'arbeitsplatz') {
            cm.current.show(e.originalEvent);
          }
        }}
        filter
        filterMode="lenient"
        filterPlaceholder="Filter"
        nodeTemplate={nodeTemplate}
      />
      </div>
    </div>
  );
}
