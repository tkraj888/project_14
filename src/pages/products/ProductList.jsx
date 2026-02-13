import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, MoreVertical, Eye, FileEdit, Trash2, Plus, X } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { productApi } from '../../api/productApi';
import { useToast } from '../../hooks/useToast';

const ProductList = () => {
  const { showToast, ToastComponent } = useToast();
  const { data: response, loading, setData } = useFetch(() => productApi.getAllProducts());
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const menuRef = useRef(null);
  const products = response?.content || [];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = products.filter(item => 
    item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productApi.deleteProduct(id);
        setData({
          ...response,
          content: response.content.filter(p => p.productId !== id)
        });
        setOpenMenuId(null);
      } catch (error) {
        showToast('Failed to delete product: ' + error.message, 'error');
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      {/* HEADER */}
      <div className="top">
        <h3>Product & category management</h3>
        <Link to="/admin/products/add" className="add-btn">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* FILTERS */}
      <div className="filters">
        <div className="search">
          <input 
            type="text" 
            placeholder="User Search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} color="#999" />
        </div>
        {/* <select><option>Products</option></select>
        <select><option>Categories</option></select>
        <select><option>Date</option></select>
        <button className="clear" onClick={() => setSearchTerm("")}>Clear</button> */}
      </div>

      {/* TABLE BOX */}
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}><input type="checkbox" /></th>
              <th>SKU</th>
              <th>PRODUCT NAME</th>
              <th>CATEGORIES</th>
              <th>PRICE</th>
              <th>QUANTITY</th>
              <th>STOCKS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product.productId}>
                <td><input type="checkbox" /></td>
                <td>{product.sku || "TS-001"}</td>
                <td>{product.productName}</td>
                <td>{product.category}</td>
                <td>{product.price} Rs.</td>
                <td>{product.stockQuantity || 0}</td>
                <td>
                  <span className={product.active ? 'active' : 'out'}>
                    {product.active ? 'Active' : 'Out'}
                  </span>
                </td>
                <td className="action">
                  <div className="dots-container" onClick={() => setOpenMenuId(openMenuId === product.productId ? null : product.productId)}>
                    <MoreVertical size={20} />
                  </div>
                  
                  {openMenuId === product.productId && (
                    <div className="menu" ref={menuRef}>
                      <div className="menu-item" onClick={() => {setSelectedProduct(product); setShowModal(true); setOpenMenuId(null);}}>
                        <Eye size={16} className="menu-icon" /> View
                      </div>
                      <Link to={`/admin/products/edit/${product.productId}`} className="menu-item">
                        <FileEdit size={16} className="menu-icon" /> Edit
                      </Link>
                      <div className="menu-item" onClick={() => handleDelete(product.productId)}>
                        <Trash2 size={16} className="menu-icon" /> Delete
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION (Placed outside table-box) */}
      {totalPages > 1 && (
        <div className="pagination-wrapper">
          <div className="pagination">
            <button className="page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Pre</button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`page-btn num ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>PRODUCT DETAILS</span>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '120px', height: '120px', background: '#eee', borderRadius: '8px' }}>
                  {selectedProduct.imageUrls?.[0] && <img src={selectedProduct.imageUrls[0]} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>}
                </div>
                <div>
                  <h4>{selectedProduct.productName}</h4>
                  <p style={{color:'#888', fontSize:'12px', margin: '5px 0'}}>ID: PRD{selectedProduct.productId}</p>
                  <p><strong>Category:</strong> {selectedProduct.category}</p>
                  <p><strong>Price:</strong> {selectedProduct.price} Rs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <ToastComponent />
    </div>
  );
};

export default ProductList;