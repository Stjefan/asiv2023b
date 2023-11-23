import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Tree,
  TreeExpandedKeysType,
  TreeNodeTemplateOptions,
} from 'primereact/tree';
import { v4 as uuid } from 'uuid';
import { ContextMenu } from 'primereact/contextmenu';
import { Toast } from 'primereact/toast';
import { map } from 'rxjs';
import { RxDocument } from 'rxdb';
import { TreeNode } from 'primereact/treenode';
import { ASIVContext } from './App';
import { groupByMultipleKeys, object2array } from './utility';

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

export function TreeView_unsafe() {
  return <div></div>
}

export function TreeView() {
  const [nodes, setNodes] = useState([]);
  const context = useContext(ASIVContext);
  const { db, setEdit, setDialogEdit } = context;

  function createNode(level = 0): any {
    if (level >= 3) {
      return { key: uuid(), label: uuid(), children: [] as any[] } as any;
    }
    return {
      key: uuid(),
      label: uuid(),
      children: [...Array(3)].map((i) => createNode(level + 1)) as any[],
    } as any;
  }

  function loadData() {
    console.log('loadData is triggered', db);
    const nodes = db.arbeitsplatzmessungen
      .find({
        selector: {
          // archiviert: true
        },
      })
      .$.subscribe((docs) => {
        setNodes(baseHandlingDocs(docs as any[], nodesMap));
      });
      return nodes
  }
  useEffect(() => {
    if (db) {
      const subscription = loadData();
      return () => subscription.unsubscribe()
    } else {
      console.log('Empty effect');
    }
  }, [db]);

  async function getDocById(id) {
    console.log("Ergebnis", await db.arbeitsplatzmessungen.findOne(id).exec())
  }


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
            setEdit(getDocById(selectedNodeKey));
            setDialogEdit(true);
            // toast.current.show({ severity: 'success', summary: 'Node Key', detail: selectedNodeKey });
        }
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
      label = <b className="text-danger"> {node.label}</b>;
    }

    return <span className={options.className}>{label}</span>;
  };

  return (
    <div className="card flex justify-content-center">
      <ContextMenu model={menu} ref={cm} />
      <Toast ref={toast} />
      <Tree
        value={nodes}
        className="w-full md:w-30rem"
        expandedKeys={expandedKeys}
        onToggle={(e) => setExpandedKeys(e.value)}
        contextMenuSelectionKey={selectedNodeKey}
        onContextMenuSelectionChange={(e) => setSelectedNodeKey(e.value as any)}
        onContextMenu={(e) => {
          if (e.node.type == "arbeitsplatz") {
          cm.current.show(e.originalEvent)}
          }
        }
        filter
        filterMode="lenient"
        filterPlaceholder="Filter"
        nodeTemplate={nodeTemplate}
      />
    </div>
  );
}
