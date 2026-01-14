'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

export default function AdminSider({ collapsed }) {
  const [activeMenu, setActiveMenu] = useState('Admission');
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);
  const [isHoveringSubmenu, setIsHoveringSubmenu] = useState(false);
  const [openMenus, setOpenMenus] = useState([]); // track expanded menus
  const router = useRouter();
  const submenuRef = useRef(null);

  const menuItems = [
	{ icon: 'mdi:note-text-outline', label: 'Admission', link: 'registration' },
  ];
  const handleCloseSubmenu = () => {
    setTimeout(() => {
      if (!isHoveringSubmenu) {
        setHoveredSubmenu(null);
      }
    }, 150);
  };

  // Close all submenus when clicking a main category without submenu
  useEffect(() => {
    const clickedMain = menuItems.find(item => item.label === activeMenu);
    if (clickedMain && !clickedMain.submenu) {
      setOpenMenus([]); // close all open submenus
    }
  }, [activeMenu]);

  return (
    <>
      <aside
        className={`h-screen bg-white border-r border-gray-200 fixed top-0 left-0 shadow z-50 overflow-y-scroll scrollbar-hide transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-52'
        }`}
      >
        {/* Logo */}
        <div
          className={`flex items-center px-4 py-4 border-b border-gray-200 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!collapsed ? (
            <a href="/" className="flex items-center space-x-2">
              <img src="/admin/assets/images/sathya-school-logo.png" alt="Site Logo" className="h-9" />
              <span className="text-sm font-bold text-gray-700">Sathya School</span>
            </a>
          ) : (
            <img src="/admin/assets/images/sathya-school-logo.png" alt="Site Logo" className="h-9" />
          )}
        </div>

        {/* Menu */}
        <nav className="mt-4">
          <ul className="px-2 space-y-1">
            {menuItems.map((item) =>
              item.submenu ? (
                <SidebarItemWithDropdown
                  key={item.label}
                  item={item}
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                  collapsed={collapsed}
                  hoveredSubmenu={hoveredSubmenu}
                  setHoveredSubmenu={setHoveredSubmenu}
                  handleCloseSubmenu={handleCloseSubmenu}
                  openMenus={openMenus}
                  setOpenMenus={setOpenMenus}
                  router={router}
                />
              ) : (
                <SidebarItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  link={item.link}
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                  collapsed={collapsed}
                  router={router}
                />
              )
            )}
          </ul>
        </nav>
      </aside>

      {/* Hover Submenu Box for collapsed mode */}
      {hoveredSubmenu && collapsed && (
        <div
          ref={submenuRef}
          className="absolute bg-white border border-gray-200 shadow-lg rounded-md p-2 z-50"
          style={{
            top: hoveredSubmenu.position.top,
            left: hoveredSubmenu.position.left
          }}
          onMouseEnter={() => setIsHoveringSubmenu(true)}
          onMouseLeave={() => {
            setIsHoveringSubmenu(false);
            setHoveredSubmenu(null);
          }}
        >
          <ul className="space-y-1">
            {hoveredSubmenu.items.map((sub) => (
              <li key={sub.label}>
                <button
                  onClick={() => {
                    setActiveMenu(sub.label);
                    setHoveredSubmenu(null);
                    router.push(`/admin/${sub.link}`);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded text-sm space-x-3 ${
                    activeMenu === sub.label
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:text-blue-500'
                  }`}
                >
                  <Icon icon={sub.icon} className="text-lg" />
                  <span>{sub.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function SidebarItem({ icon, label, link, activeMenu, setActiveMenu, collapsed, router }) {
  const active = activeMenu === label;
  return (
    <li>
      <button
        onClick={() => {
          setActiveMenu(label);
          router.push(`/admin/${link}`);
        }}
        className={`w-full flex items-center px-3 py-3 rounded-lg text-md font-medium transition-colors duration-200 ${
          active ? 'bg-red-500 text-white' : 'text-gray-700 hover:text-red-500'
        } ${collapsed ? 'justify-center' : 'space-x-3'}`}
      >
        <Icon icon={icon} className={collapsed ? 'text-2xl' : 'text-xl'} />
        {!collapsed && <span>{label}</span>}
      </button>
    </li>
  );
}

function SidebarItemWithDropdown({
  item,
  activeMenu,
  setActiveMenu,
  collapsed,
  setHoveredSubmenu,
  handleCloseSubmenu,
  openMenus,
  setOpenMenus,
  router
}) {
  const ref = useRef(null);
  const isOpen = openMenus.includes(item.label);

  const handleMouseEnter = () => {
    if (collapsed && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHoveredSubmenu({
        label: item.label,
        items: item.submenu,
        position: {
          top: rect.top + 'px',
          left: rect.right + 'px'
        }
      });
    }
  };

  const toggleMenu = () => {
    if (isOpen) {
      setOpenMenus((prev) => prev.filter((menu) => menu !== item.label));
    } else {
      setOpenMenus((prev) => [...prev, item.label]);
    }
  };

  return (
    <li
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={collapsed ? handleCloseSubmenu : undefined}
    >
      {/* Parent button */}
      <button
        onClick={() => {
          if (collapsed) return; // collapsed uses hover
          toggleMenu();
        }}
        className={`w-full flex items-center px-3 py-3 rounded-lg text-md font-medium transition-colors duration-200 ${
          item.submenu.some((sub) => sub.label === activeMenu)
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-700 hover:text-blue-500'
        } ${collapsed ? 'justify-center' : 'space-x-3'}`}
      >
        <Icon icon={item.icon} className={collapsed ? 'text-2xl' : 'text-xl'} />
        {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
        {!collapsed && (
          <Icon
            icon={isOpen ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            className="text-lg"
          />
        )}
      </button>

      {/* Expanded mode submenu only if open */}
      {!collapsed && isOpen && (
        <ul className="ml-2 mt-1 space-y-1">
          {item.submenu.map((sub) => (
            <li key={sub.label}>
              <button
                onClick={() => {
                  setActiveMenu(sub.label);
                  router.push(`/admin/${sub.link}`);
                }}
                className={`w-full flex items-center px-3 py-2 rounded text-sm space-x-3 ${
                  activeMenu === sub.label
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:text-blue-500'
                }`}
              >
                <Icon icon={sub.icon} className="text-lg" />
                <span>{sub.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
