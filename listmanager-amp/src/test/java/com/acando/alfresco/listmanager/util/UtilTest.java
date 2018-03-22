package com.acando.alfresco.listmanager.util;

import static org.junit.Assert.*;

import org.junit.Test;

public class UtilTest {

  @Test
  public void testMatchesUUID() {
    String uuid = "637dc842-4994-4a3e-899b-daa9a374dda2";
    String notUUID = "this_is_a_non_uuid_string";
    assertTrue(Util.matchesUUID(uuid));
    assertFalse(Util.matchesUUID(notUUID));
  }

}
