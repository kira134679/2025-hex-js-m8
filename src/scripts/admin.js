import axios from 'axios';
import { timestampToDate } from './utils/helpers';
import '../styles/admin.css';

const orderTableBody = document.querySelector('.orderPage-tableBody');
const discardAllBtn = document.querySelector('.discardAllBtn');
let orderData = [];
let share = [];

await init();

async function init() {
  await getOrderList();
  renderOrderList(orderData);
  share = getRevenueShare();
  renderChart(share);

  orderTableBody.addEventListener('click', async e => {
    e.preventDefault();
    const target = e.target;
    const className = target.getAttribute('class');
    if (className === 'orderStatus-Btn') {
      const { id, status } = target.dataset;

      const newStatus = !(status === 'true');

      await changeOrderStatus(id, newStatus);
      renderOrderList(orderData);
      return;
    }

    if (className === 'delSingleOrder-Btn') {
      const { id } = target.dataset;
      await deleteOrder(id);
      renderOrderList(orderData);
      share = getRevenueShare();
      renderChart(share);
      return;
    }

    return;
  });

  discardAllBtn.addEventListener('click', async e => {
    e.preventDefault();
    await deleteAllOrders();
    renderOrderList(orderData);
    share = getRevenueShare();
    renderChart(share);
  });
}

async function getOrderList() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/admin/${import.meta.env.VITE_API_PATH}/orders`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: import.meta.env.VITE_TOKEN,
        },
      },
    );

    const { orders } = res.data;
    orderData = orders;
  } catch (error) {
    alert(error.response.data.message);
  }
}

function renderOrderList(orders) {
  let contents = '';
  if (orders.length === 0) {
    contents = '目前沒有訂單';
  } else {
    contents = orders
      .map(order => {
        const { products } = order;
        const productContents = products.map(p => `<p>${p.title} x ${p.quantity}</p>`).join('');

        return `<tr>
              <td>${order.id}</td>
              <td>
                <p>${order.user.name}</p>
                <p>${order.user.tel}</p>
              </td>
              <td>${order.user.address}</td>
              <td>${order.user.email}</td>
              <td>${productContents}</td>
              <td>${timestampToDate(order.createdAt)}</td>
              <td class="orderStatus">
                <a href="#" class="orderStatus-Btn" data-id="${order.id}" data-status="${order.paid}">${order.paid ? '已處理' : '未處理'}</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${order.id}" />
              </td>
            </tr>`;
      })
      .join('');
  }

  orderTableBody.innerHTML = contents;
}

async function changeOrderStatus(orderId, orderStatus) {
  try {
    const res = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/admin/${import.meta.env.VITE_API_PATH}/orders`,
      {
        data: {
          id: orderId,
          paid: orderStatus,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: import.meta.env.VITE_TOKEN,
        },
      },
    );

    const { orders } = res.data;
    orderData = orders;
  } catch (error) {
    alert(error.response.data.message);
  }
}

async function deleteOrder(orderId) {
  try {
    const res = await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/admin/${import.meta.env.VITE_API_PATH}/orders/${orderId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: import.meta.env.VITE_TOKEN,
        },
      },
    );

    const { orders } = res.data;
    orderData = orders;
  } catch (error) {
    alert(error.response.data.message);
  }
}

async function deleteAllOrders() {
  try {
    const res = await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/admin/${import.meta.env.VITE_API_PATH}/orders`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: import.meta.env.VITE_TOKEN,
        },
      },
    );

    const { orders } = res.data;
    orderData = orders;
  } catch (error) {
    alert(error.response.data.message);
  }
}

function getRevenueShare() {
  const products = orderData.flatMap(o => o.products);

  const map = new Map();
  for (const p of products) {
    if (!map.get(p.id)) {
      map.set(p.id, { category: p.category, title: p.title, totalPrice: p.price * p.quantity });
      continue;
    }
    const { category, title, totalPrice } = map.get(p.id);
    const newPrice = totalPrice + p.price * p.quantity;
    map.set(p.id, { category, title, totalPrice: newPrice });
  }
  return [...map.values()];
}

function renderChart(data) {
  let columnData = [];
  const sortedData = [...data].sort((a, b) => b.totalPrice - a.totalPrice);

  if (sortedData.length <= 3) {
    columnData = sortedData;
  } else {
    const [top1, top2, top3, ...others] = sortedData;
    const othersTotalPrice = others.reduce((accumulator, currentValue) => accumulator + currentValue.totalPrice, 0);
    columnData = [top1, top2, top3, { title: '其他', totalPrice: othersTotalPrice }];
  }

  const colorArr = ['#DACBFF', '#9D7FEA', '#5434A7', '#301E5F'];
  const colorData = {};
  columnData.forEach((v, i) => {
    colorData[v.title] = colorArr[i];
  });

  const chartData = {
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: 'pie',
      columns: columnData.map(item => [item.title, item.totalPrice]),
      colors: colorData,
    },
  };

  c3.generate(chartData);
}
