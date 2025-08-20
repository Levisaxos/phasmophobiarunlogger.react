// components/manage/common/ManageLayout.jsx
import React from 'react';

const ManageLayout = ({
  title,
  items = [],
  selectedItem,
  onItemSelect,
  onAddNew,
  isEditing,
  children,
  renderListItem,
  getItemDisplayText = (item) => item.name,
  getItemSubText = () => null
}) => {
  return (
    <div className="flex gap-6" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Left Sidebar - Items List */}
      <div className="w-80 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-4 border-b border-gray-600 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4">
            <div className="space-y-2">
              {/* Add New Button */}
              <button
                onClick={onAddNew}
                className="w-full text-left px-3 py-3 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200 border-2 border-dashed border-green-300"
              >
                + Add New {title.slice(0, -1)}
              </button>
              
              {/* Existing Items */}
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onItemSelect(item)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                    selectedItem?.id === item.id && isEditing
                      ? 'bg-gray-500 text-gray-900'
                      : 'text-gray-300 hover:bg-gray-800 border border-gray-500'
                  }`}
                >
                  {renderListItem ? renderListItem(item) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{getItemDisplayText(item)}</div>
                        {getItemSubText(item) && (
                          <div className="text-xs text-gray-400">
                            {getItemSubText(item)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Item Editor */}
      <div className="flex-1 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-6 border-b border-gray-600 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-100">
            {isEditing 
              ? (selectedItem ? `Edit ${title.slice(0, -1)}` : `Add New ${title.slice(0, -1)}`) 
              : `${title.slice(0, -1)} Details`
            }
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageLayout;