---
layout: blog
title: Blog
excerpt: Unsorted thoughts and strong opinions about Design, programming, side projects, and personal growth (I guess).
---

<ul class='blog-list'>
  {% for post in site.posts %}
  <li class='blog-list-item'>
    <a href="{{ post.url }}">
      <span class='blog-list-item-date'>
        <time datetime="{{ post.date | date_to_xmlschema }}">
        {%- assign date_format = date_format | default: "%b %-d %Y" -%}
        {{ post.date | date: date_format }}
        </time>
      </span>
      <span class='blog-list-item-title'>{{ post.title }}</span>
    </a>
  </li>
  {% endfor %}
</ul>
