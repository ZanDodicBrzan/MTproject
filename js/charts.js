const chartOptions = {
    maintainAspectRatio: false,
    legend: {
        display: false,
    },
    tooltips: {
        enabled: false,
    },
    elements: {
        point: {
            radius: 0
        },
    },
    scales: {
        xAxes: [{
            gridLines: false,
            scaleLabel: false,
            ticks: {
                display: false
            }
        }],
        yAxes: [{
            gridLines: false,
            scaleLabel: false,
            ticks: {
                display: false,
                suggestedMin: 0,
                suggestedMax: 10
            }
        }]
    }
  };
  //
  var ctx = document.getElementById('chart1').getContext('2d');
  var chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [1, 2, 1, 3, 5, 4, 7],
        datasets: [
            {
                backgroundColor: "rgba(101, 116, 205, 0.05)",
                borderColor: "rgba(101, 116, 205, 0.8)",
                borderWidth: 2,
                data: [1, 2, 1, 3, 4, 3, 5],
            },
        ],
    },
    options: chartOptions
  });
  var ctx = document.getElementById('chart2').getContext('2d');
  var chart = new Chart(ctx, {
      type: "line",
      data: {
          labels: [2, 3, 2, 9, 7, 7, 4],
          datasets: [
              {
                  backgroundColor: "rgba(246, 109, 155, 0.05)",
                  borderColor: "rgba(246, 109, 155, 0.8)",
                  borderWidth: 2,
                  data: [1, 2, 1.50, 3.50, 2, 3, 5],
              },
          ],
      },
      options: chartOptions
  });
  //
  var ctx = document.getElementById('chart3').getContext('2d');
  var chart = new Chart(ctx, {
      type: "line",
      data: {
          labels: [2, 5, 1, 3, 2, 6, 7],
          datasets: [
              {
                  backgroundColor: "rgba(246, 153, 63, 0.05)",
                  borderColor: "rgba(246, 153, 63, 0.8)",
                  borderWidth: 2,
                  data: [0, 0.4, 1, 2, 3.5, 5, 7],
              },
          ],
      },
      options: chartOptions
  });
  
  var ctx = document.getElementById('chart4').getContext('2d');
  var chart = new Chart(ctx, {
      type: "line",
      data: {
          labels: [2, 5, 1, 3, 2, 6, 7],
          datasets: [
              {
                  backgroundColor: "rgba(255, 12, 7, 0.05)",
                  borderColor: "rgba(255, 12, 7, 0.8)",
                  borderWidth: 2,
                  data: [2, 2.3, 1, 3, 2, 4, 3.3],
              },
          ],
      },
      options: chartOptions
  });
  
  var ctx = document.getElementById('chart5').getContext('2d');
  var chart = new Chart(ctx, {
      type: "line",
      data: {
          labels: [2, 5, 1, 3, 2, 6, 7],
          datasets: [
              {
                  backgroundColor: "rgba(214, 68, 224, 0.05)",
                  borderColor: "rgba(214, 68, 224, 0.8)",
                  borderWidth: 2,
                  data: [2, 5, 1, 3, 2, 6, 7],
              },
          ],
      },
      options: chartOptions
  });
  
  var ctx = document.getElementById('chart6').getContext('2d');
  var chart = new Chart(ctx, {
      type: "line",
      data: {
          labels: [2, 5, 1, 3, 2, 6, 7],
          datasets: [
              {
                  backgroundColor: "rgba(126, 211, 7, 0.05)",
                  borderColor: "rgba(126, 211, 7, 0.8)",
                  borderWidth: 2,
                  data: [1.5, 2, 3, 2.5, 2.2, 2.5, 3],
              },
          ],
      },
      options: chartOptions
  });
  