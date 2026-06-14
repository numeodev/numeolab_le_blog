<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template name="format-date">
    <xsl:param name="date"/>
    
    <xsl:variable name="day" select="substring($date, 6, 2)"/>
    
    <xsl:variable name="month-abbr" select="substring($date, 9, 3)"/>
    
    <xsl:variable name="year" select="substring($date, 13, 4)"/>
    
    <xsl:variable name="month-french">
      <xsl:choose>
        <xsl:when test="$month-abbr = 'Jan'">janvier</xsl:when>
        <xsl:when test="$month-abbr = 'Feb'">février</xsl:when>
        <xsl:when test="$month-abbr = 'Mar'">mars</xsl:when>
        <xsl:when test="$month-abbr = 'Apr'">avril</xsl:when>
        <xsl:when test="$month-abbr = 'May'">mai</xsl:when>
        <xsl:when test="$month-abbr = 'Jun'">juin</xsl:when>
        <xsl:when test="$month-abbr = 'Jul'">juillet</xsl:when>
        <xsl:when test="$month-abbr = 'Aug'">août</xsl:when>
        <xsl:when test="$month-abbr = 'Sep'">septembre</xsl:when>
        <xsl:when test="$month-abbr = 'Oct'">octobre</xsl:when>
        <xsl:when test="$month-abbr = 'Nov'">novembre</xsl:when>
        <xsl:when test="$month-abbr = 'Dec'">décembre</xsl:when>
        <xsl:otherwise><xsl:value-of select="$month-abbr"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    
    <xsl:value-of select="number($day)"/>
    <xsl:text> </xsl:text>
    <xsl:value-of select="$month-french"/>
    <xsl:text> - </xsl:text>
    <xsl:value-of select="$year"/>
  </xsl:template>
  
  <xsl:template match="/">
    <html>
      <head>
        <title>Flux RSS - Numeolab</title>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            background: #f5f5f5; 
          }
          .header { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
          }
          .item { 
            background: white; 
            padding: 15px; 
            margin-bottom: 15px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
          }
          h1 { color: #333; margin: 0 0 10px 0; }
          h2 { color: #555; font-size: 1.2em; margin: 0 0 10px 0; }
          .description { color: #666; margin-bottom: 10px; }
          .date { color: #999; font-size: 0.9em; }
          a { color: #0066cc; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1><xsl:value-of select="rss/channel/title"/></h1>
          <p><xsl:value-of select="rss/channel/description"/></p>
          <p><strong>URL du site : </strong> <a href="{rss/channel/link}"><xsl:value-of select="rss/channel/link"/></a></p>
        </div>
        
        <xsl:for-each select="rss/channel/item">
          <div class="item">
            <h2><a href="{link}"><xsl:value-of select="title"/></a></h2>
            <div class="description"><xsl:value-of select="description"/></div>
            <div class="date">
              <xsl:call-template name="format-date">
                <xsl:with-param name="date" select="pubDate"/>
              </xsl:call-template>
            </div>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
  
</xsl:stylesheet>
