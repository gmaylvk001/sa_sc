'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

export default function AdminSider({ collapsed }) {
  const [activeMenu, setActiveMenu] = useState('Admission');
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);
  const [isHoveringSubmenu, setIsHoveringSubmenu] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const router = useRouter();
  const submenuRef = useRef(null);

  // ✅ Active menu detection
  useEffect(() => {
    const path = window.location.pathname;

    if (path.includes('/gallery/categories')) setActiveMenu('Categories');
    else if (path.includes('/gallery/images')) setActiveMenu('Images');
    else if (path.includes('/registration')) setActiveMenu('Admission');
    else if (path.includes('/blog/blog_categories')) setActiveMenu('Blog Categories');
    else if (path.includes('/blog')) setActiveMenu('Posts');
    else if (path.includes('/activities')) setActiveMenu('Activities');
    else if (path.includes('/flash-news')) setActiveMenu('Flash News'); // ✅ NEW
    else if (path.includes('/events')) setActiveMenu('Events');
  }, []);

  // ✅ MENU ITEMS
  const menuItems = [
    { icon: 'mdi:note-text-outline', label: 'Admission', link: 'registration' },

    {
      icon: 'mdi:image-multiple-outline',
      label: 'Gallery',
      submenu: [
        { icon: 'mdi:folder-multiple-image', label: 'Categories', link: 'gallery/categories' },
        { icon: 'mdi:image-outline', label: 'Images', link: 'gallery/images' },
      ],
    },

    {
      icon: 'mdi:note-text-outline',
      label: 'Blogs',
      submenu: [
        { icon: 'mdi:folder-text-outline', label: 'Blog Categories', link: 'blog/blog_categories' },
        { icon: 'mdi:file-document-outline', label: 'Posts', link: 'blog' },
      ],
    },

    { icon: 'mdi:trophy-outline', label: 'Activities', link: 'activities' },

    // ✅ FLASH NEWS ADDED
    {
      icon: 'mdi:newspaper-variant-outline',
      label: 'Flash News',
      link: 'flash-news',
    },

    { icon: 'mdi:calendar-month-outline', label: 'Events', link: 'events' },
  ];

  const handleCloseSubmenu = () => {
    setTimeout(() => {
      if (!isHoveringSubmenu) setHoveredSubmenu(null);
    }, 150);
  };

  return (
    <>
      <aside
        className={`h-screen bg-white border-r border-gray-200 fixed top-0 left-0 shadow z-50 overflow-y-scroll scrollbar-hide transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-52'
        }`}
      >
        {/* LOGO */}
        <div
          className={`flex items-center px-4 py-4 border-b border-gray-200 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!collapsed ? (
            <a href="/" className="flex items-center space-x-2">
              <img src="/admin/assets/images/sathya-school-logo.png" alt="logo" className="h-9" />
              <span className="text-sm font-bold text-gray-700">Sathya School</span>
            </a>
          ) : (
            <img src="/admin/assets/images/sathya-school-logo.png" alt="logo" className="h-9" />
          )}
        </div>

        {/* MENU */}
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
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
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

      {/* HOVER SUBMENU */}
      {hoveredSubmenu && collapsed && (
        <div
          ref={submenuRef}
          className="absolute bg-white border border-gray-200 shadow-lg rounded-md p-2 z-50"
          style={{ top: hoveredSubmenu.position.top, left: hoveredSubmenu.position.left }}
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
                      ? 'bg-red-500 text-white'
                      : 'text-gray-700 hover:text-red-500'
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
  openMenu,
  setOpenMenu,
  router,
}) {
  const ref = useRef(null);
  const isOpen = openMenu === item.label;

  const handleMouseEnter = () => {
    if (collapsed && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHoveredSubmenu({
        label: item.label,
        items: item.submenu,
        position: { top: rect.top + 'px', left: rect.right + 'px' },
      });
    }
  };

  return (
    <li
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={collapsed ? handleCloseSubmenu : undefined}
    >
      <button
        onClick={() => {
          if (!collapsed) setOpenMenu(isOpen ? null : item.label);
        }}
        className={`w-full flex items-center px-3 py-3 rounded-lg text-md font-medium transition-colors duration-200 ${
          item.submenu.some((sub) => sub.label === activeMenu)
            ? 'bg-red-100 text-red-600'
            : 'text-gray-700 hover:text-red-500'
        } ${collapsed ? 'justify-center' : 'space-x-3'}`}
      >
        <Icon icon={item.icon} className={collapsed ? 'text-2xl' : 'text-xl'} />
        {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
        {!collapsed && (
          <Icon icon={isOpen ? 'mdi:chevron-down' : 'mdi:chevron-right'} className="text-lg" />
        )}
      </button>

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
                    ? 'bg-red-500 text-white'
                    : 'text-gray-700 hover:text-red-500'
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
