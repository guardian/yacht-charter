# **Y**et **A**nother **CH**art **T**ool ⛵📊

*Current version: V6*



This makes responsive charts based on a Google sheet synced to S3 (manually via [visuals/docs](https://visuals.gutools.co.uk/docs/)), or a JSON object written directly to S3 (if you want to automate your chart making).

It allows for responsive annotations, updating charts in place without changing embeds, trendlines, and a bunch of other formats and features not available in the basic chart tool. Is also allows charts to be created either via the google docs -> s3 system, or programatically for charts you'd like to keep constantly updated. It is however more complicated to use, and requires some technical knowledge.

To use:

1. Put your data and chart furniture into a google spreadsheet (or JSON object with the same structure), see examples below
2. Publish your spreadsheet to S3 using the [docs tool](https://visuals.gutools.co.uk/docs/) or the backup docs tool
3. Append the spreadsheet key to the following URL like so:

```
https://interactive.guim.co.uk/embed/iframeable/2019/01/reusable-stacked-bar-chart-v6/html/index.html?key=1nySW3dnujGMcebNNzi7R5D6Z47P284S9sUafYDRJEkg&location=docsdata

OR

https://interactive.guim.co.uk/embed/iframeable/2019/01/reusable-stacked-bar-chart-v6/html/index.html?key=infection-source-vic-health-corona-2020-long-bar&location=yacht-charter-data

```

## Current chart templates available

### Vertical bar chart

![Stacked vertical bar chart](https://raw.githubusercontent.com/guardian/yacht-charter/master/imgs/bar-chart.png)

[Live example](https://interactive.guim.co.uk/embed/iframeable/2019/01/reusable-stacked-bar-chart-v6/html/index.html?key=infection-source-vic-health-corona-2020-long-bar&location=yacht-charter-data)

[Example data](https://docs.google.com/spreadsheets/d/1nySW3dnujGMcebNNzi7R5D6Z47P284S9sUafYDRJEkg/edit#gid=1454102594)

[Template](https://docs.google.com/spreadsheets/d/16mJQNYbURSBEEGUcxKSU4ztf881lWktJ61wtnbC-c2E/)

### Line chart

![Line chart](https://raw.githubusercontent.com/guardian/yacht-charter/master/imgs/line-chart.png)

[Live example](https://interactive.guim.co.uk/embed/aus/2020/yacht-charter-v5/index.html?key=melb-irsd-quartiles&location=yacht-charter-data)

[Example data](https://docs.google.com/spreadsheets/d/1Mdc7XOJWpgYWtR24WFna6g7rlYGo50U2KRlCNPsFC20/edit#gid=0)

[Template](https://docs.google.com/spreadsheets/d/1zP8GkeyRVq6FH2vKDDRXFIS2gukYAr5h28DqdXeLY6w/edit#gid=0)

