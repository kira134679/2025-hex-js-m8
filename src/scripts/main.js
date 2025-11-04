import axios from 'axios';
import '../styles/main.css';
import { formatedPrice } from './utils/helpers';

const productList = document.querySelector('.productWrap');
const productSelector = document.querySelector('.productSelect');
const tableBody = document.querySelector('.shoppingCart-tableBody');
const totalPrice = document.getElementById('totalPrice');
let productStore = [];
let cartsStore = [];

async function init() {
  await getProductList();

  productSelector.addEventListener('change', e => {
    const category = e.target.value;

    const filteredProducts = productStore.filter(p => {
      if (category === '全部') return productStore;
      return p.category === category;
    });

    renderProductList(filteredProducts);
  });

  await getCarts();
}

await init();

async function getProductList() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/customer/${import.meta.env.VITE_API_PATH}/products`,
    );

    productStore = res.data.products;
    renderProductList(productStore);
  } catch (error) {
    console.log(error);
    alert(error.response);
    return;
  }
}

function renderProductList(products) {
  let contents = '';
  products.forEach(p => {
    contents += `<li class="productCard">
                   <h4 class="productType">新品</h4>
                   <img
                     src="${p.images}"
                     alt=""
                   />
                   <a href="#" class="addCardBtn">加入購物車</a>
                   <h3>${p.title}</h3>
                   <del class="originPrice">NT${formatedPrice(p.origin_price)}</del>
                   <p class="nowPrice">NT${formatedPrice(p.price)}</p>
                 </li>`;
  });

  productList.innerHTML = contents;
}

async function getCarts() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/customer/${import.meta.env.VITE_API_PATH}/carts`,
    );

    const { carts, finalTotal } = res.data;
    cartsStore = carts;
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
    return;
  }
}

function renderCarts(carts) {
  let contents = '';

  if (carts.length === 0) {
    contents = '目前購物車沒有商品';
  } else {
    carts.forEach(item => {
      contents += `<tr>
                     <td>
                       <div class="cardItem-title">
                         <img src="${item.product.images}" alt="" />
                         <p>${item.product.title}</p>
                       </div>
                     </td>
                     <td>NT${formatedPrice(item.product.price)}</td>
                     <td>${item.quantity}</td>
                     <td>NT${formatedPrice(item.product.price * item.quantity)}</td>
                     <td class="discardBtn">
                       <a href="#" class="material-icons"> clear </a>
                     </td>
                   </tr>`;
    });
  }

  tableBody.innerHTML = contents;
}

function renderTotalPrice(price) {
  totalPrice.textContent = formatedPrice(price);
}
