library(shiny)
library(ggplot2)

shinyServer(function(input, output, session) {

  output$chartPlot <- renderPlot({

    if(input$chartType == 'hist'){
        p <- qplot(iris[[input$xaxis]], fill=iris[[input$color]], alpha = 0.2, position = 'identity') +
            xlab(input$xaxis) + labs(fill=input$color) + guides(alpha=F)
    }else if(input$chartType == 'scatter'){
        p <- qplot(iris[[input$xaxis]], iris[[input$yaxis]], color=iris[[input$color]]) +
            xlab(input$xaxis) + ylab(input$yaxis) + labs(color=input$color)
    }else if(input$chartType == 'line'){
        p <- qplot(iris[[input$xaxis]], iris[[input$yaxis]], color=iris[[input$color]], geom = 'line') +
            xlab(input$xaxis) + ylab(input$yaxis) + labs(color=input$color)
    }else if(input$chartType == 'boxplot'){
        p <- qplot(iris[[input$xaxis]], iris[[input$yaxis]],  geom = 'boxplot') +
            xlab(input$xaxis) + ylab(input$yaxis)
    }else if(input$chartType == 'bubble'){
        p <- qplot(iris[[input$xaxis]], iris[[input$yaxis]], size=iris[[input$color]]) +
            xlab(input$xaxis) + ylab(input$yaxis) + labs(size=input$color)
    }
    print(p)
  })
})
