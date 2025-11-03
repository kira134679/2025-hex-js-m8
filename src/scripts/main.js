import axios from 'axios';
import '../styles/main.css';
import { formatedPrice } from './utils/helpers';

const productList = document.querySelector('.productWrap');

async function init() {
  await getProductList();
}

await init();

async function getProductList() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/customer/${import.meta.env.VITE_API_PATH}/products`,
    );
    renderProductList(res.data.products);
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
