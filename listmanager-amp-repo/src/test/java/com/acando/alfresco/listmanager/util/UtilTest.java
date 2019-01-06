package com.acando.alfresco.listmanager.util;

import static org.junit.Assert.*;

import org.apache.commons.lang.StringUtils;
import org.junit.Test;

public class UtilTest {

  @Test
  public void testMatchesUUID() {
    String uuid = "637dc842-4994-4a3e-899b-daa9a374dda2";
    String notUUID = "this_is_a_non_uuid_string";
    assertTrue(matchesUUID(uuid));
    assertFalse(matchesUUID(notUUID));
  }
  
  private boolean matchesUUID(String string) {
    if (StringUtils.isNotBlank(string)) {
      return string.matches("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");
    } else {
      return false;
    }
  }

}
