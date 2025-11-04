import axios from 'axios';
import '../styles/main.css';
import { formatedPrice } from './utils/helpers';

const productList = document.querySelector('.productWrap');
const productSelector = document.querySelector('.productSelect');
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
