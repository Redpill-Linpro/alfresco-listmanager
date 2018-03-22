package com.acando.alfresco.listmanager.util;

import org.apache.commons.lang.StringUtils;

public class Util {

  public static boolean matchesUUID(String string) {
    if (StringUtils.isNotBlank(string)) {
      return string.matches("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");
    } else {
      return false;
    }
  }
}
